import WAWebJS, { Client, LocalAuth } from 'whatsapp-web.js';
import { CHROMIUM_PATH, COUNTRIES, IS_PRODUCTION, SOCKET_RESPONSES } from '../../config/const';
import IContact from '../../types/whatsapp/contact';
import { UserService } from '../../database/services';
import fs from 'fs';
import logger from '../../config/Logger';
import QRCode from 'qrcode';
import { Socket } from 'socket.io';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';

type ClientID = string;

type MappedContacts = {
	[contact_number: string]: IContact;
};

const PUPPETEER_ARGS = [
	'--no-sandbox',
	'--disable-setuid-sandbox',
	'--unhandled-rejections=strict',
	'--disable-dev-shm-usage',
	'--disable-accelerated-2d-canvas',
	'--no-first-run',
	'--no-zygote',
	'--single-process', // <- this one doesn't works in Windows
	'--disable-gpu',
];

enum STATUS {
	UNINITIALIZED = 'UNINITIALIZED',
	INITIALIZED = 'INITIALIZED',
	QR_READY = 'QR_READY',
	AUTHENTICATED = 'AUTHENTICATED',
	READY = 'READY',
	DISCONNECTED = 'DISCONNECTED',
	LOGGED_OUT = 'LOGGED_OUT',
	DESTROYED = 'DESTROYED',
}

export class WhatsappProvider {
	private client: Client;
	private client_id: ClientID;
	private static clientsMap = new Map<ClientID, WhatsappProvider>();

	private qrCode: string | undefined;
	private number: string | undefined;
	private contact: WAWebJS.Contact | undefined;
	private user_service: UserService | undefined;
	private socket: Socket | undefined;

	private status: STATUS;

	private callbackHandlers: {
		onDestroy: (client_id: ClientID) => void;
	};

	private constructor(cid: ClientID) {
		this.client_id = cid;

		this.client = new Client({
			restartOnAuthFail: true,

			puppeteer: {
				headless: true,
				args: PUPPETEER_ARGS,
				executablePath: IS_PRODUCTION
					? CHROMIUM_PATH
					: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
			},

			authStrategy: new LocalAuth({
				clientId: this.client_id,
			}),
		});

		this.status = STATUS.UNINITIALIZED;
		this.callbackHandlers = {
			onDestroy: () => {},
		};

		this.attachListeners();
		WhatsappProvider.clientsMap.set(this.client_id, this);
	}

	public static getInstance(client_id: ClientID) {
		if (!client_id) {
			throw new Error();
		}
		if (WhatsappProvider.clientsMap.has(client_id)) {
			return WhatsappProvider.clientsMap.get(client_id)!;
		}

		return new WhatsappProvider(client_id);
	}

	public getClient() {
		return this.client;
	}

	public initialize() {
		if (this.status !== STATUS.UNINITIALIZED) return;
		this.client.initialize();
		this.status = STATUS.INITIALIZED;
		this.sendToClient({
			event: SOCKET_RESPONSES.INITIALIZED,
			data: this.client_id,
		});
	}

	private async attachListeners() {
		this.client.on('qr', async (qrCode) => {
			try {
				this.qrCode = await QRCode.toDataURL(qrCode);
				this.status = STATUS.QR_READY;

				this.sendToClient({
					event: SOCKET_RESPONSES.QR_GENERATED,
					data: this.qrCode,
				});
			} catch (err) {}
		});

		this.client.on('authenticated', async () => {
			this.status = STATUS.AUTHENTICATED;
			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_AUTHENTICATED,
			});
		});

		this.client.on('ready', async () => {
			this.status = STATUS.READY;

			this.number = this.client.info.wid.user;
			this.contact = await this.client.getContactById(this.client.info.wid._serialized);

			this.user_service = await UserService.createUser(this.number, {
				isBusiness: this.contact.isBusiness,
			});

			await this.user_service.login(this.client_id);

			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_READY,
			});
		});

		this.client.on('disconnected', () => {
			this.status = STATUS.DISCONNECTED;

			this.user_service?.logout(this.client_id);
			this.logoutClient();

			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_CLOSED,
			});
		});
	}

	private async sendToClient({ event, data = null }: { event: SOCKET_RESPONSES; data?: any }) {
		if (!this.socket) return;
		this.socket.emit(event, data);
	}

	public attachToSocket(socket: Socket) {
		this.socket = socket;

		if (this.status === STATUS.UNINITIALIZED) {
			return;
		} else if (this.status === STATUS.INITIALIZED) {
			this.sendToClient({
				event: SOCKET_RESPONSES.INITIALIZED,
				data: this.client_id,
			});
		} else if (this.status === STATUS.QR_READY) {
			this.sendToClient({
				event: SOCKET_RESPONSES.QR_GENERATED,
				data: this.qrCode,
			});
		} else if (this.status === STATUS.AUTHENTICATED) {
			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_AUTHENTICATED,
			});
		} else if (this.status === STATUS.READY) {
			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_READY,
			});
		} else if (this.status === STATUS.DISCONNECTED) {
			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_CLOSED,
			});
		}
	}

	public getContact() {
		if (!this.contact) {
			throw new InternalError(INTERNAL_ERRORS.WHATSAPP_ERROR.WHATSAPP_NOT_READY);
		}
		return this.contact;
	}

	public isReady() {
		return this.status === STATUS.READY;
	}
	public isBusiness() {
		return this.getContact().isBusiness;
	}

	async logoutClient() {
		return new Promise((resolve, reject) => {
			this.callbackHandlers.onDestroy(this.client_id);
			if (this.status === STATUS.LOGGED_OUT || this.status === STATUS.DESTROYED) {
				return resolve(true);
			}
			const id = setInterval(() => {
				this.client
					.logout()
					.then(() => {
						this.status = STATUS.LOGGED_OUT;
						this.destroyClient();
						clearInterval(id);
						resolve(true);
					})
					.catch(() => {});
			}, 1000);
			WhatsappProvider.clientsMap.delete(this.client_id);
		});
	}

	async getMappedContacts() {
		const contacts = (await this.client.getContacts())
			.filter((contact) => contact.isMyContact && contact.name && contact.number)
			.reduce(async (accPromise, contact) => {
				const acc = await accPromise;
				const country_code = await contact.getCountryCode();
				acc[contact.number] = {
					name: contact.name ?? 'Unknown',
					isBusiness: contact.isBusiness,
					country: COUNTRIES[country_code as string],
					number: contact.number,
					public_name: contact.pushname ?? '',
				};
				return acc;
			}, Promise.resolve({} as MappedContacts));

		return contacts;
	}

	static async removeUnwantedSessions() {
		const sessions = await UserService.getRevokedSessions();
		for (const session of sessions) {
			await WhatsappProvider.getInstance(session.client_id).logoutClient();
			WhatsappProvider.deleteSession({
				client_id: session.client_id,
			});
			session.remove();
		}
		logger.info(`Removed ${sessions.length} unwanted sessions`);
	}

	static async removeInactiveSessions() {
		const sessions = await UserService.getInactiveSessions();
		for (const session of sessions) {
			await WhatsappProvider.getInstance(session.client_id).logoutClient();
		}
		logger.info(`Removed ${sessions.length} inactive sessions`);
	}

	destroyClient() {
		this.callbackHandlers.onDestroy(this.client_id);
		if (this.status === STATUS.DESTROYED) {
			return;
		}
		let count = 0;
		const id = setInterval(() => {
			if (count >= 10) {
				clearInterval(id);
			}
			this.client
				.destroy()
				.then(() => {
					this.status = STATUS.DESTROYED;
					clearInterval(id);
				})
				.catch(() => {
					count++;
				});
		}, 1000);
		WhatsappProvider.clientsMap.delete(this.client_id);
	}

	static deleteSession({ client_id }: { client_id: string }) {
		const path = __basedir + '/.wwebjs_auth/session-' + client_id;
		const dataExists = fs.existsSync(path);
		if (dataExists) {
			fs.rmSync(path, {
				recursive: true,
			});
		}
	}

	async getSavedContacts() {
		const contacts = (await this.client.getContacts()).filter(
			(contact) => contact.isMyContact && !contact.isMe && !contact.isGroup
		);

		return contacts;
	}

	async getNonSavedContacts() {
		const chats = await this.client.getChats();

		const non_saved_contacts = await Promise.all(
			chats.map(async (chat) => {
				if (chat.isGroup) return Promise.resolve(null);
				const contact = await this.client.getContactById(chat.id._serialized);
				if (!contact.isMyContact && !contact.isGroup && !contact.isMe) {
					return contact;
				}
				return null;
			})
		);

		return non_saved_contacts.filter((contact) => contact !== null) as WAWebJS.Contact[];
	}

	onDestroy(func: (client_id: ClientID) => void) {
		this.callbackHandlers.onDestroy = func;
	}
}
