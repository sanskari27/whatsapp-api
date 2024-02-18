import * as http from 'http';
import { Socket, Server as SocketServer } from 'socket.io';
import { SOCKET_EVENTS } from '../../config/const';
import { UserService } from '../../services';
import { generateClientID } from '../../utils/ExpressUtils';
import { WhatsappProvider } from '../whatsapp_provider';

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
				let client_id = '';
				if (cid) {
					const { valid, user } = await UserService.isValidAuth(cid);
					if (!valid) {
						WhatsappProvider.deleteSession(cid);
						client_id = generateClientID();
					} else {
						const existing_client_id = WhatsappProvider.clientByUser(user._id);
						client_id = existing_client_id || cid;
					}
				} else {
					client_id = generateClientID();
				}
				SocketServerProvider.socketsMap.set(socket.id, client_id);
				this.initializeWhatsappClient(socket, client_id);
			});
			socket.on('disconnect', () => {
				const client_id = SocketServerProvider.socketsMap.get(socket.id);
				if (!client_id) {
					return;
				}
				UserService.sessionDisconnected(client_id);
			});
		});
	}

	private initializeWhatsappClient(socketClient: Socket, client_id: string) {
		const whatsappInstance = WhatsappProvider.getInstance(client_id);
		whatsappInstance.initialize();
		whatsappInstance.attachToSocket(socketClient);
		whatsappInstance.onDestroy(function (client_id) {
			SocketServerProvider.clientsMap.delete(client_id);
		});

		SocketServerProvider.clientsMap.set(client_id, whatsappInstance);
	}
}
