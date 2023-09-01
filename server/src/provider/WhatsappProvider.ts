import { Client, LocalAuth } from 'whatsapp-web.js';
import { generateClientID } from './Utils';

type ClientID = string;

export class WhatsappProvider {
	static getWhatsappClient(cid?: ClientID) {
		const clientId = cid || generateClientID();
		const client = new Client({
			puppeteer: {
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox', '--unhandled-rejections=strict'],
			},
			authStrategy: new LocalAuth({ clientId }),
		});

		return [clientId, client] as [ClientID, Client];
	}
}
