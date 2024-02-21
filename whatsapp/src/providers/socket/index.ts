import * as http from 'http';
import { Socket, Server as SocketServer } from 'socket.io';
import { SOCKET_EVENTS } from '../../config/const';
import { generateID } from '../../utils/helper';
import WhatsappProvider from '../whatsapp';

type WhatsappClientID = string;
type SocketID = string;

export default class SocketServerProvider {
	private static instance: SocketServerProvider;
	private io: SocketServer;

	private static clientsMap = new Map<WhatsappClientID, WhatsappProvider>();
	private static socketsMap = new Map<SocketID, WhatsappClientID>();

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
			socket.on(SOCKET_EVENTS.INITIALIZE, async (cid: string | undefined) => {
				cid = cid ?? generateID();
				SocketServerProvider.socketsMap.set(socket.id, cid);
				this.initializeWhatsappClient(socket, cid);
			});
			socket.on('disconnect', () => {
				const client_id = SocketServerProvider.socketsMap.get(socket.id);
				if (!client_id) {
					return;
				}
			});
		});
	}

	private initializeWhatsappClient(socketClient: Socket, client_id: string) {
		const whatsappInstance = WhatsappProvider.getInstance(client_id);
		whatsappInstance.initialize();
		whatsappInstance.attachToSocket(socketClient);
		whatsappInstance.onDestroy(function (client_id: string) {
			SocketServerProvider.clientsMap.delete(client_id);
		});

		SocketServerProvider.clientsMap.set(client_id, whatsappInstance);
	}
}
