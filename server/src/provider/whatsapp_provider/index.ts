import QRCode from 'qrcode';
import { Socket } from 'socket.io';
import WAWebJS, { Client, LocalAuth } from 'whatsapp-web.js';
import { CHROMIUM_PATH, SOCKET_RESPONSES } from '../../config/const';
import { UserService } from '../../database/services';
import BotService from '../../database/services/bot';
import VoteResponseService from '../../database/services/vote-response';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import DateUtils from '../../utils/DateUtils';
import { Delay } from '../../utils/ExpressUtils';

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
	private vote_response_service: VoteResponseService | undefined;

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
				executablePath: CHROMIUM_PATH,
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

			this.user_service = await UserService.createUser(this.number, this.contact.isBusiness);

			this.sendToClient({
				event: SOCKET_RESPONSES.WHATSAPP_READY,
			});

			await this.user_service.login(this.client_id);

			this.bot_service = new BotService(this.user_service.getUser());
			this.bot_service.attachWhatsappProvider(this);
			this.vote_response_service = new VoteResponseService(this.user_service.getUser());

			// const message = await this.client.getMessageById(
			// 	'true_918797721460@c.us_3EB0043C8758BB059411E4'
			// );
			// console.log('message: ', message);

			// const contactId = await this.client.getNumberId('918797721460');
			// console.log('contactId', contactId);

			// if (!contactId) return;

			// const message = await this.client.sendMessage(
			// 	contactId._serialized,
			// 	new Poll('Winter or Summer?', ['Winter', 'Summer'])
			// );
			// console.log('message', message);

			// const contact = await this.client.getContactById(contactId._serialized);
			// if (contact.isBusiness) {
			// 	console.log((contact as BusinessContact).businessProfile);
			// }else{
			// 	console.log("Not business contact")
			// }
		});

		this.client.on('vote_update', async (vote) => {
			/** The vote that was affected: */
			if (!this.vote_response_service) return;
			if (!vote.parentMessage.id.fromMe) return;
			const pollDetails = this.vote_response_service.getPollDetails(vote.parentMessage);
			const contact = await this.client.getContactById(vote.voter);
			if (!this.contact || contact.id._serialized === this.contact.id._serialized) {
				return;
			}
			const details = {
				...pollDetails,
				voter_number: '',
				voter_name: '',
				group_name: '',
				selected_options: vote.selectedOptions.map((opt) => opt.name),
				voted_at: DateUtils.getMoment(vote.interractedAtTs).toDate(),
			};

			const chat = await this.client.getChatById(pollDetails.chat_id);
			if (chat.isGroup) {
				details.group_name = chat.name;
			}

			details.voter_number = contact.number;
			details.voter_name = (contact.name || contact.pushname) ?? '';

			await this.vote_response_service.saveVote(details);

			details.selected_options.map((opt) => {
				if (!this.bot_service) return;
				this.bot_service.handleMessage(chat.id._serialized, opt, contact);
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

		this.client.on('message', async (message) => {
			if (!this.bot_service) return;
			const isGroup = (await message.getChat()).isGroup;
			this.bot_service.handleMessage(message.from, message.body, await message.getContact(), {
				isGroup,
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
		await Delay(10);
		this.callbackHandlers.onDestroy(this.client_id);
		if (this.status === STATUS.LOGGED_OUT || this.status === STATUS.DESTROYED) {
			return;
		}
		const id = setInterval(() => {
			this.client
				.logout()
				.then(() => {
					this.status = STATUS.LOGGED_OUT;
					this.destroyClient();
					clearInterval(id);
				})
				.catch(() => {});
		}, 1000);
		WhatsappProvider.clientsMap.delete(this.client_id);
	}

	async destroyClient() {
		await Delay(10);
		this.callbackHandlers.onDestroy(this.client_id);
		if (this.status === STATUS.DESTROYED) {
			return;
		}
		let count = 0;
		const id = setInterval(() => {
			if (count >= 10 || this.status === STATUS.DESTROYED) {
				clearInterval(id);
				return;
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

	static getInstancesCount(): number {
		return WhatsappProvider.clientsMap.size;
	}
}
