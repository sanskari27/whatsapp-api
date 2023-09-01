import { Server as SocketServer, Socket } from 'socket.io';
import { WhatsappProvider } from '../provider/WhatsappProvider';
import { Client as WhatsappClient } from 'whatsapp-web.js';
import QRCode from 'qrcode';
import * as http from 'http';
import { SOCKET_EVENTS, SOCKET_RESPONSES } from '../config/const';

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
		this.io = new SocketServer(server);
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
			socket.on(SOCKET_EVENTS.INITIALIZE, (clientId: string | undefined) => {
				this.initializeWhatsappClient(socket, clientId);
			});
		});
	}

	private initializeWhatsappClient(socketClient: Socket, cid: string | undefined) {
		const [clientId, client] = WhatsappProvider.getWhatsappClient(cid);
		client.initialize();
		const entry: SocketClientEntry = {
			socketClient: socketClient,
			whatsappClient: client,
		};
		SocketServerProvider.clientsMap.set(clientId, entry);
		this.attachWhatsappListeners(clientId);
		this.sendToClient({
			clientId,
			event: SOCKET_RESPONSES.INITIALIZED,
			data: clientId,
		});
	}

	private attachWhatsappListeners(clientId: WhatsappClientID) {
		const entry = SocketServerProvider.clientsMap.get(clientId);
		if (!entry) return;
		const { whatsappClient: whatsapp } = entry;
		whatsapp.on('qr', async (qrCode) => {
			try {
				const qrCodeBase64 = await QRCode.toDataURL(qrCode);
				this.sendToClient({
					clientId,
					event: SOCKET_RESPONSES.QR_GENERATED,
					data: qrCodeBase64,
				});
			} catch (err) {
				console.log(err);
			}
		});
		whatsapp.on('ready', () => {
			this.sendToClient({
				clientId,
				event: SOCKET_RESPONSES.WHATSAPP_READY,
				data: null,
			});
		});
	}

	public static getWhatsappClient(clientId: WhatsappClientID) {
		const entry = SocketServerProvider.clientsMap.get(clientId);
		if (!entry) return null;
		return entry.whatsappClient;
	}

	private sendToClient({
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
// export function connectSocket(server: http.Server) {
// 	const io = new SocketServer(server);

// 	io.on('connection', (socket) => {
// 		socket.on('initialize', (data) => {

//         }
// 	});
// }
