import QRCode from 'qrcode';
import { Socket } from 'socket.io';
import WAWebJS, { Client, LocalAuth } from 'whatsapp-web.js';
import { CHROMIUM_PATH, IS_PRODUCTION, SOCKET_RESPONSES } from '../../config/const';
import { UserService } from '../../database/services';
import BotService from '../../database/services/bot';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import VCardBuilder from '../../utils/VCardBuilder';

type ClientID = string;

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
	private bot_service: BotService | undefined;

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

			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_READY,
			});

			await this.user_service.login(this.client_id);

			this.bot_service = new BotService(this.user_service.getUser());
			this.bot_service.attachWhatsappProvider(this);

			const contactId = await this.client.getNumberId('919931224934');
			if (!contactId) return;

			const vCard = new VCardBuilder()
				.setFirstName('Sanskar')
				.setContactPhone('+917546027568', '917546027568')
				.setContactWork('+916205667548')
				.setEmail('sanskarkumar85111@gmail.com')
				.setOrganization('Fidelity International')
				.setTitle('Software Developer')
				.setCountry('India')
				.setPincode('851214')
				.setState('Bihar')
				.setLink('https://github.com/sanskar85')
				.build();
			console.log(vCard);

			this.client.sendMessage(contactId._serialized, vCard);
		});
		// 			this.client.sendMessage(
		// 				contactId._serialized,
		// 				`BEGIN:VCARD
		// VERSION:3.0
		// FN;CHARSET=UTF-8:Sanskar Kumar
		// N;CHARSET=UTF-8:Kumar;Sanskar;;;
		// TEL;type=PHONE;waid=917546027568:+917546027568
		// TEL;TYPE=WORK,VOICE:+916205667548
		// EMAIL;CHARSET=UTF-8;type=HOME,INTERNET:sanskarkumar85111@gmail.com
		// EMAIL;CHARSET=UTF-8;type=WORK,INTERNET:sanskarkumar851@gmail.com
		// ADR;CHARSET=UTF-8;TYPE=Home:;;SBI Building ;Khagaria;;851214;India
		// TITLE;CHARSET=UTF-8:Software Developer
		// URL;CHARSET=UTF-8:https://www.instagram.com/sanskar_85/
		// END:VCARD`,
		// 				{ parseVCards: true }
		// 			);
		// 		});

		this.client.on('disconnected', () => {
			this.status = STATUS.DISCONNECTED;

			this.user_service?.logout(this.client_id);
			this.logoutClient();

			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_CLOSED,
			});
		});

		this.client.on('message', async (message) => {
			if (message.vCards) {
				console.log(message.vCards);
			}
			if (!this.bot_service) return;
			this.bot_service.handleMessage(message, await message.getContact());
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

	onDestroy(func: (client_id: ClientID) => void) {
		this.callbackHandlers.onDestroy = func;
	}

	static deleteSession(client_id: string) {
		WhatsappProvider.clientsMap.delete(client_id);
	}
}
