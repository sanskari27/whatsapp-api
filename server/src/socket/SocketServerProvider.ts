import { Server as SocketServer, Socket } from 'socket.io';
import { WhatsappProvider } from '../provider/whatsapp_provider';
import * as http from 'http';
import { SOCKET_EVENTS } from '../config/const';
import { generateClientID } from '../utils/ExpressUtils';

type WhatsappClientID = string;

export default class SocketServerProvider {
	private static instance: SocketServerProvider;
	private io: SocketServer;

	private static clientsMap = new Map<WhatsappClientID, WhatsappProvider>();

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
		});
	}

	private async initializeWhatsappClient(socketClient: Socket, cid: string | undefined) {
		const client_id = cid || generateClientID();
		const whatsappInstance = WhatsappProvider.getInstance(client_id);
		whatsappInstance.initialize();
		whatsappInstance.attachToSocket(socketClient);

		SocketServerProvider.clientsMap.set(client_id, whatsappInstance);
	}
}
