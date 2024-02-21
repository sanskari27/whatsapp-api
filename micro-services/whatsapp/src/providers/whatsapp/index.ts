import QRCode from 'qrcode';
import { Socket } from 'socket.io';
import WAWebJS, { BusinessContact, Client, LocalAuth } from '../../../packages/whatsapp-web';
import { CHROME, SOCKET_RESPONSES } from '../../config/const';
import DateUtils from '../../utils/DateUtils';
import WhatsappUtils from '../../utils/WhatsappUtils';
import { Delay } from '../../utils/helper';

type ClientID = string;

const PUPPETEER_ARGS = [
	'--no-sandbox',
	'--disable-setuid-sandbox',
	'--unhandled-rejections=strict',
	// '--disable-dev-shm-usage',
	// '--disable-accelerated-2d-canvas',
	// '--no-first-run',
	// '--no-zygote',
	// '--single-process', // <- this one doesn't works in Windows
	// '--disable-gpu',
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

export default class WhatsappProvider {
	private client: Client;
	private client_id: ClientID;
	private static clientsMap = new Map<ClientID, WhatsappProvider>();

	private socket: Socket | undefined;
	private qrCode: string | undefined;
	private number: string | undefined;
	private contact: WAWebJS.Contact | undefined;

	private status: STATUS;

	private callbackHandlers: {
		onDestroy: (client_id: ClientID) => void;
	};

	private constructor(cid: ClientID) {
		this.client_id = cid;

		this.client = new Client({
			restartOnAuthFail: true,

			puppeteer: {
				headless: false,
				args: PUPPETEER_ARGS,
				executablePath: CHROME,
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

	public getClientID() {
		return this.client_id;
	}

	public initialize() {
		if (this.status !== STATUS.UNINITIALIZED) return;
		this.client.initialize();
		this.status = STATUS.INITIALIZED;
		this.sendToClient(SOCKET_RESPONSES.INITIALIZED, this.client_id);
	}

	private async attachListeners() {
		this.client.on('qr', async (qrCode) => {
			try {
				this.qrCode = await QRCode.toDataURL(qrCode);
				this.status = STATUS.QR_READY;

				this.sendToClient(SOCKET_RESPONSES.QR_GENERATED, this.qrCode);
			} catch (err) {}
		});

		this.client.on('authenticated', async () => {
			this.status = STATUS.AUTHENTICATED;
			this.sendToClient(SOCKET_RESPONSES.WHATSAPP_AUTHENTICATED);
		});

		this.client.on('ready', async () => {
			this.number = this.client.info.wid.user;
			this.contact = await this.client.getContactById(this.client.info.wid._serialized);

			const business_details = this.contact.isBusiness
				? WhatsappUtils.getBusinessDetails(this.contact as BusinessContact)
				: {
						description: '',
						email: '',
						websites: [] as string[],
						latitude: 0,
						longitude: 0,
						address: '',
				  };
			console.log(this.number, business_details);

			this.sendToClient(SOCKET_RESPONSES.WHATSAPP_READY);
			this.status = STATUS.READY;

			// this.user_service = await UserService.createUser({
			// 	name: this.client.info.pushname,
			// 	phone: this.number,
			// 	isBusiness: this.contact.isBusiness,
			// 	business_details,
			// });
			// await this.user_service.login(this.client_id);

			// this.bot_service = new BotService(this.user_service.getUser());
			// this.group_service = new GroupMergeService(this.user_service.getUser());
			// this.bot_service.attachWhatsappProvider(this);
			// this.vote_response_service = new VoteResponseService(this.user_service.getUser());
		});

		this.client.on('vote_update', async (vote) => {
			/** The vote that was affected: */
			if (!vote.parentMessage.id?.fromMe) return;
			const pollDetails = WhatsappUtils.getPollDetails(vote.parentMessage);
			const contact = await this.client.getContactById(vote.voter);
			if (!this.contact || contact.id._serialized === this.contact.id._serialized) {
				return;
			}
			const details = {
				...pollDetails,
				voter_number: '',
				voter_name: '',
				group_name: '',
				selected_option: vote.selectedOptions.map((opt: { name: string }) => opt.name),
				voted_at: DateUtils.getMoment(vote.interractedAtTs).toDate(),
			};

			const chat = await this.client.getChatById(pollDetails.chat_id);
			if (chat.isGroup) {
				details.group_name = chat.name;
			}

			details.voter_number = contact.number;
			details.voter_name = (contact.name || contact.pushname) ?? '';

			// await this.vote_response_service.saveVote(details);

			// details.selected_option.map((opt) => {
			// 	if (!this.bot_service) return;
			// 	this.bot_service.handleMessage(chat.id._serialized, opt, contact, {
			// 		fromPoll: true,
			// 		isGroup: false,
			// 	});
			// });
		});

		this.client.on('disconnected', () => {
			this.status = STATUS.DISCONNECTED;
			this.logoutClient();
			this.sendToClient(SOCKET_RESPONSES.WHATSAPP_CLOSED);
		});

		this.client.on('message', async (message) => {
			// const chat = await message.getChat();
			// const isGroup = chat.isGroup;
			// const contact = await message.getContact();
			// this.bot_service.handleMessage(message.from, message.body, contact, {
			// 	isGroup,
			// 	fromPoll: false,
			// });
			// if (isGroup) {
			// 	this.group_service?.sendGroupReply(this.client, {
			// 		chat: chat as GroupChat,
			// 		message,
			// 		contact,
			// 	});
			// }
		});
	}

	private async sendToClient(event: SOCKET_RESPONSES, data: string | null = null) {
		if (!this.socket) return;
		this.socket.emit(event, data);
	}

	public attachToSocket(socket: Socket) {
		this.socket = socket;

		if (this.status === STATUS.UNINITIALIZED) {
			return;
		} else if (this.status === STATUS.INITIALIZED) {
			this.sendToClient(SOCKET_RESPONSES.INITIALIZED, this.client_id);
		} else if (this.status === STATUS.QR_READY) {
			this.sendToClient(SOCKET_RESPONSES.QR_GENERATED, this.qrCode);
		} else if (this.status === STATUS.AUTHENTICATED) {
			this.sendToClient(SOCKET_RESPONSES.WHATSAPP_AUTHENTICATED);
		} else if (this.status === STATUS.READY) {
			this.sendToClient(SOCKET_RESPONSES.WHATSAPP_READY);
		} else if (this.status === STATUS.DISCONNECTED) {
			this.sendToClient(SOCKET_RESPONSES.WHATSAPP_CLOSED);
		}
	}

	public getContact() {
		return this.contact;
	}

	public isReady() {
		return this.status === STATUS.READY;
	}
	public isBusiness() {
		return this.getContact()?.isBusiness;
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
