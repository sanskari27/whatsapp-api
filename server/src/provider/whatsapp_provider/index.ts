import { Client, LocalAuth } from 'whatsapp-web.js';
import { COUNTRIES } from '../../config/const';
import IContact from '../../types/whatsapp/contact';
import { generateClientID } from '../../utils/ExpressUtils';

type ClientID = string;

type MappedContacts = {
	[number: string]: IContact;
};

export class WhatsappProvider {
	private static clientsMap = new Map<ClientID, Client>();

	static getWhatsappClient(cid?: ClientID) {
		if (cid && WhatsappProvider.clientsMap.has(cid)) {
			return [cid, WhatsappProvider.clientsMap.get(cid)!] as [ClientID, Client];
		}

		const clientId = cid || generateClientID();
		const client = new Client({
			restartOnAuthFail: true,
			puppeteer: {
				headless: true,
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					'--disable-dev-shm-usage',
					'--disable-accelerated-2d-canvas',
					'--no-first-run',
					'--no-zygote',
					'--single-process', // <- this one doesn't works in Windows
					'--disable-gpu',
				],
			},
			authStrategy: new LocalAuth({ clientId }),
		});

		WhatsappProvider.clientsMap.set(clientId, client);

		return [clientId, client] as [ClientID, Client];
	}

	static async removeClient(cid: ClientID) {
		const client = WhatsappProvider.clientsMap.get(cid);
		if (!client) return;
		try {
			await client.logout();
		} catch (e) {
			//ignore
		}
		WhatsappProvider.clientsMap.delete(cid);
	}

	static async getMappedContacts(whatsapp: Client) {
		const contacts = (await whatsapp.getContacts())
			.filter((contact) => contact.isMyContact && contact.name && contact.number)
			.reduce(async (accPromise, contact) => {
				const acc = await accPromise;
				const country_code = await contact.getCountryCode();
				acc[contact.number] = {
					name: contact.name ?? 'Unknown',
					isBusiness: contact.isBusiness,
					country: COUNTRIES[country_code as string],
					number: contact.number,
				};
				return acc;
			}, Promise.resolve({} as MappedContacts));

		return contacts;
	}
}
