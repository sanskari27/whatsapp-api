import WAWebJS, { Client, LocalAuth } from 'whatsapp-web.js';
import { CHROMIUM_PATH, COUNTRIES, IS_PRODUCTION } from '../../config/const';
import IContact from '../../types/whatsapp/contact';
import { generateClientID } from '../../utils/ExpressUtils';
import { UserService } from '../../database/services';
import fs from 'fs';
import logger from '../../config/Logger';
import { IAuthDetail } from '../../types/user';

type ClientID = string;

type MappedContacts = {
	[contact_number: string]: IContact;
};

const SESSION_ACTIVE = true;

export class WhatsappProvider {
	private static clientsMap = new Map<ClientID, Client>();

	static async getWhatsappClient(cid?: ClientID) {
		if (cid && WhatsappProvider.clientsMap.has(cid)) {
			const client = WhatsappProvider.clientsMap.get(cid)!;
			let sessionActive = false;

			try {
				const state = await client.getState();
				if (state === WAWebJS.WAState.CONNECTED) {
					sessionActive = true;
				}
			} catch (e) {
				//ignore
			}

			return [cid, WhatsappProvider.clientsMap.get(cid)!, sessionActive] as [
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
				executablePath: IS_PRODUCTION ? CHROMIUM_PATH : undefined,
			},
			authStrategy: new LocalAuth({ clientId }),
		});

		WhatsappProvider.clientsMap.set(clientId, client);

		return [clientId, client, !SESSION_ACTIVE] as [ClientID, Client, boolean];
	}

	static async logoutClient(cid: ClientID) {
		return new Promise((resolve, reject) => {
			const client = WhatsappProvider.clientsMap.get(cid);
			if (!client) return resolve(false);
			WhatsappProvider.deleteSession({ client_id: cid });
			const id = setInterval(() => {
				client
					.logout()
					.then(() => {
						clearInterval(id);
						resolve(true);
					})
					.catch(() => {});
			}, 1000);
			WhatsappProvider.clientsMap.delete(cid);
		});
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

	static async removeUnwantedSessions() {
		const sessions = await UserService.getInactiveSessions();
		for (const session of sessions) {
			await WhatsappProvider.logoutClient(session.client_id);
			WhatsappProvider.deleteSession({
				session,
				client_id: session.client_id,
			});
		}
		logger.info(`Removed ${sessions.length} unwanted sessions`);
	}

	static destroyClient(client: Client) {
		const id = setInterval(() => {
			client
				.destroy()
				.then(() => {
					clearInterval(id);
				})
				.catch(() => {});
		}, 1000);
	}

	static deleteSession({ session, client_id }: { session?: IAuthDetail; client_id: string }) {
		const path = __basedir + '/.wwebjs_auth/session-' + client_id;
		const sessionExists = fs.existsSync(path);
		if (sessionExists && IS_PRODUCTION) {
			fs.rmSync(path, {
				recursive: true,
			});
			session?.remove();
		}
	}

	static async getSavedContacts(whatsapp: Client) {
		const contacts = (await whatsapp.getContacts()).filter(
			(contact) => contact.isMyContact && !contact.isMe && !contact.isGroup
		);

		return contacts;
	}

	static async getNonSavedContacts(whatsapp: Client) {
		const chats = await whatsapp.getChats();

		const non_saved_contacts = await Promise.all(
			chats.map(async (chat) => {
				if (chat.isGroup) return Promise.resolve(null);
				const contact = await whatsapp.getContactById(chat.id._serialized);
				if (!contact.isMyContact && !contact.isGroup && !contact.isMe) {
					return contact;
				}
				return null;
			})
		);

		return non_saved_contacts.filter((contact) => contact !== null) as WAWebJS.Contact[];
	}
}
