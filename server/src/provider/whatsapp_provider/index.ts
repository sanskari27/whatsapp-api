import WAWebJS, { Client, LocalAuth } from 'whatsapp-web.js';
import { COUNTRIES } from '../../config/const';
import IContact from '../../types/whatsapp/contact';
import { generateClientID } from '../../utils/ExpressUtils';

type ClientID = string;

type MappedContacts = {
	[number: string]: IContact;
};

const SESSION_ACTIVE = true;

export class WhatsappProvider {
	private static clientsMap = new Map<ClientID, Client>();

	static getWhatsappClient(cid?: ClientID) {
		if (cid && WhatsappProvider.clientsMap.has(cid)) {
			return [cid, WhatsappProvider.clientsMap.get(cid)!, SESSION_ACTIVE] as [
				ClientID,
				Client,
				boolean
			];
		}

		const clientId = cid || generateClientID();
		const client = new Client({
			restartOnAuthFail: true,
			puppeteer: {
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox', '--unhandled-rejections=strict'],
			},
			authStrategy: new LocalAuth({ clientId }),
		});

		WhatsappProvider.clientsMap.set(clientId, client);

		return [clientId, client, !SESSION_ACTIVE] as [ClientID, Client, boolean];
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
					public_name: contact.pushname ?? '',
				};
				return acc;
			}, Promise.resolve({} as MappedContacts));

		return contacts;
	}

	static async getSavedContacts(whatsapp: Client) {
		const contacts = (await whatsapp.getContacts()).filter(
			(contact) => contact.isMyContact && !contact.isMe && !contact.isGroup
		);

		return contacts;
	}

	static async getNonSavedContacts(whatsapp: Client) {
		const contacts = (await whatsapp.getContacts()).filter(
			(contact) => !contact.isMyContact && !contact.isMe && !contact.isGroup
		);

		const non_saved_contacts = await Promise.all(
			contacts.map(async (contact) => {
				const chat = await whatsapp.getChatById(contact.id._serialized);
				if (!chat.lastMessage) return null;
				return contact;
			})
		);

		const filtered_contacts = non_saved_contacts.filter(
			(contact) => contact !== null
		) as WAWebJS.Contact[];

		return filtered_contacts;
	}
}
