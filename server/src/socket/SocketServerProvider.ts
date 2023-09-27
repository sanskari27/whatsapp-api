import { Server as SocketServer, Socket } from 'socket.io';
import { WhatsappProvider } from '../provider/whatsapp_provider';
import WAWebJS, { Client as WhatsappClient } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import * as http from 'http';
import { SOCKET_EVENTS, SOCKET_RESPONSES } from '../config/const';
import { UserService } from '../database/services';

type WhatsappClientID = string;
type SocketClientEntry = {
	socketClient: Socket;
	whatsappClient: WhatsappClient;
};

export default class SocketServerProvider {
	private static instance: SocketServerProvider;
	private io: SocketServer;

	private static clientsMap = new Map<WhatsappClientID, SocketClientEntry>();

	private constructor(server: http.Server) {
		this.io = new SocketServer(server, {
			cors: {
				origin: '*',
			},
		});
		this.attachListeners();
	}

	public static getInstance(server: http.Server): SocketServerProvider {
		if (!SocketServerProvider.instance) {
			SocketServerProvider.instance = new SocketServerProvider(server);
		}

		return SocketServerProvider.instance;
	}

	private attachListeners() {
		this.io.on('connection', (socket) => {
			socket.on(SOCKET_EVENTS.INITIALIZE, async (clientId: string | undefined) => {
				await this.initializeWhatsappClient(socket, clientId);
			});
			socket.on('disconnect', async () => {
				const clientId = SocketServerProvider.getClientId(socket);
				if (!clientId) return;
				const entry = SocketServerProvider.clientsMap.get(clientId);
				if (!entry) return;
				const { whatsappClient } = entry;
				WhatsappProvider.destroyClient(whatsappClient);
				SocketServerProvider.clientsMap.delete(clientId);
			});
		});
	}

	private async initializeWhatsappClient(socketClient: Socket, cid: string | undefined) {
		const [clientId, client, sessionActive] = await WhatsappProvider.getWhatsappClient(cid);

		const entry: SocketClientEntry = {
			socketClient: socketClient,
			whatsappClient: client,
		};
		SocketServerProvider.clientsMap.set(clientId, entry);
		SocketServerProvider.sendToClient({
			clientId,
			event: SOCKET_RESPONSES.INITIALIZED,
			data: clientId,
		});
		if (sessionActive) {
			SocketServerProvider.sendToClient({
				clientId,
				event: SOCKET_RESPONSES.WHATSAPP_READY,
				data: clientId,
			});
		} else {
			client.initialize().catch(() => {
				SocketServerProvider.clientsMap.delete(clientId);
			});
			this.attachWhatsappListeners(clientId);
		}
	}

	private static getClientId(socket: Socket) {
		for (const [clientId, entry] of SocketServerProvider.clientsMap) {
			if (entry.socketClient === socket) {
				return clientId;
			}
		}
		return null;
	}

	private async attachWhatsappListeners(clientId: WhatsappClientID) {
		const whatsapp = await SocketServerProvider.getWhatsappClient(clientId, true);

		if (!whatsapp) return;

		whatsapp.on('qr', async (qrCode) => {
			try {
				const qrCodeBase64 = await QRCode.toDataURL(qrCode);
				SocketServerProvider.sendToClient({
					clientId,
					event: SOCKET_RESPONSES.QR_GENERATED,
					data: qrCodeBase64,
				});
			} catch (err) {}
		});
		whatsapp.on('authenticated', async () => {
			SocketServerProvider.sendToClient({
				clientId,
				event: SOCKET_RESPONSES.WHATSAPP_AUTHENTICATED,
				data: null,
			});
		});

		whatsapp.on('ready', async () => {
			const number = whatsapp.info.wid.user;
			const contact = await whatsapp.getContactById(whatsapp.info.wid._serialized);

			SocketServerProvider.sendToClient({
				clientId,
				event: SOCKET_RESPONSES.WHATSAPP_READY,
				data: null,
			});

			UserService.createUser(number, { isBusiness: contact.isBusiness })
				.then((service) => {
					service
						.login(clientId)
						.then(() => {})
						.catch(() => {});
				})
				.catch(() => {});
		});

		whatsapp.on('disconnected', () => {
			SocketServerProvider.sendToClient({
				clientId,
				event: SOCKET_RESPONSES.WHATSAPP_CLOSED,
				data: null,
			});

			const number = whatsapp.info.wid.user;
			UserService.getService(number)
				.then((service) => {
					service
						.logout(clientId)
						.then(() => {})
						.catch(() => {});
				})
				.catch(() => {});
			WhatsappProvider.removeClient(clientId);
		});
	}

	public static async getWhatsappClient(clientId: WhatsappClientID, force = false) {
		const entry = SocketServerProvider.clientsMap.get(clientId);

		if (!entry) return null;

		if (force) {
			return entry.whatsappClient;
		}

		try {
			const state = await entry.whatsappClient.getState();
			if (state !== WAWebJS.WAState.CONNECTED) {
				return null;
			}
		} catch (e) {
			return null;
		}
		return entry.whatsappClient;
	}

	private static sendToClient({
		clientId,
		event,
		data,
	}: {
		clientId: WhatsappClientID;
		event: SOCKET_RESPONSES;
		data: any;
	}) {
		const entry = SocketServerProvider.clientsMap.get(clientId);
		if (!entry) return;
		entry.socketClient.emit(event, data);
	}
}
