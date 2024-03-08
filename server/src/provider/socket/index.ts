import * as http from 'http';
import { Socket, Server as SocketServer } from 'socket.io';
import { SOCKET_EVENTS } from '../../config/const';
import { WhatsappProvider } from '../whatsapp_provider';

type WhatsappClientID = string;

export default class SocketServerProvider {
	private static instance: SocketServerProvider;
	private io: SocketServer;
	private device_io;

	public static clientsMap = new Map<WhatsappClientID, WhatsappProvider>();
	public static socketsMap = new Map<WhatsappClientID, Socket>();
	public static attachedSockets = new Map<string, Socket>();

	private constructor(server: http.Server) {
		this.io = new SocketServer(server, {
			cors: {
				origin: '*',
			},
		});
		this.device_io = this.io.of('/add-device');
		this.attachListeners();
	}

	public static getInstance(server: http.Server): SocketServerProvider {
		if (!SocketServerProvider.instance) {
			SocketServerProvider.instance = new SocketServerProvider(server);
		}

		return SocketServerProvider.instance;
	}

	public static getDeviceSocket() {
		if (!SocketServerProvider.instance) {
			return null;
		}
		return SocketServerProvider.instance.device_io;
	}

	private attachListeners() {
		this.device_io.on('connection', (socket) => {
			let client_id = '';
			socket.on(SOCKET_EVENTS.INITIALIZE, (cid: string | undefined) => {
				if (!cid) {
					return;
				}
				const provider = SocketServerProvider.clientsMap.get(cid);
				if (!provider) {
					return;
				}
				socket.join(cid);
				client_id = cid;
				SocketServerProvider.socketsMap.set(cid, socket);
				provider.initialize();
				provider.sendWhatsappStatus();
			});
			socket.on('disconnect', () => {
				SocketServerProvider.socketsMap.delete(client_id);
			});
		});
		this.io.on('connection', (socket) => {
			let conn_id = '';
			socket.on(SOCKET_EVENTS.CONNECT, (id: string | undefined) => {
				if (!id) {
					return;
				}
				conn_id = id;
				SocketServerProvider.attachedSockets.set(id, socket);
			});
			socket.on('disconnect', () => {
				SocketServerProvider.attachedSockets.delete(conn_id);
			});
		});
	}
}
