import fs from 'fs';
import WAWebJS, { GroupChat } from 'whatsapp-web.js';
import { COUNTRIES, IS_PRODUCTION, SESSION_STARTUP_WAIT_TIME } from '../config/const';
import { UserService } from '../database/services';
import APIError, { API_ERRORS } from '../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../errors/internal-errors';
import { WhatsappProvider } from '../provider/whatsapp_provider';
import { IContact } from '../types/whatsapp';
import Logger from './logger';

export type MappedContacts = {
	[contact_number: string]: IContact;
};

export default class WhatsappUtils {
	private whatsapp: WhatsappProvider;
	constructor(whatsapp: WhatsappProvider) {
		this.whatsapp = whatsapp;
	}

	async getChatIdsByNumbers(numbers: string[]) {
		const numbersPromise = numbers.map(async (number) => {
			const numberID = await this.whatsapp.getClient().getNumberId(number);
			if (!numberID) {
				return null;
			}
			return numberID._serialized;
		});

		return (await Promise.all(numbersPromise)).filter((number) => number !== null) as string[];
	}

	async getChatIdsWithNumberByNumbers(numbers: string[]) {
		const numbersPromise = numbers.map(async (number) => {
			const numberID = await this.whatsapp.getClient().getNumberId(number);
			if (!numberID) {
				return null;
			}
			return {
				number,
				numberId: numberID._serialized,
			};
		});

		return (await Promise.all(numbersPromise)).filter((number) => number !== null) as {
			number: string;
			numberId: string;
		}[];
	}

	async getChatIdsByGroup(group_id: string) {
		const chat = await this.whatsapp.getClient().getChatById(group_id);
		if (!chat.isGroup) {
			throw new InternalError(INTERNAL_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID);
		}

		return (chat as GroupChat).participants.map((participant) => participant.id._serialized);
	}

	async getChatIdsByLabel(label_id: string) {
		if (!this.whatsapp.isBusiness()) {
			throw new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED);
		}
		const chats = await this.whatsapp.getClient().getChatsByLabelId(label_id);

		return chats.map((chat) => chat.id._serialized);
	}

	async getSavedContacts() {
		const contacts = (await this.whatsapp.getClient().getContacts()).filter(
			(contact) => contact.isMyContact && !contact.isMe && !contact.isGroup
		);

		return contacts;
	}

	async getNonSavedContacts() {
		const chats = await this.whatsapp.getClient().getChats();

		const non_saved_contacts = await Promise.all(
			chats.map(async (chat) => {
				if (chat.isGroup) return Promise.resolve(null);
				const contact = await this.whatsapp.getClient().getContactById(chat.id._serialized);
				if (!contact.isMyContact && !contact.isGroup && !contact.isMe) {
					return contact;
				}
				return null;
			})
		);

		return non_saved_contacts.filter((contact) => contact !== null) as WAWebJS.Contact[];
	}

	async contactsWithCountry(contacts: WAWebJS.Contact[]) {
		const contacts_with_country_code = contacts.map(async (contact) => {
			const country_code = await contact.getCountryCode();
			const country = COUNTRIES[country_code as string];
			return {
				name: contact.name,
				number: contact.number,
				isBusiness: contact.isBusiness ? 'Business' : 'Personal',
				country,
				public_name: contact.pushname ?? '',
			};
		});

		return await Promise.all(contacts_with_country_code);
	}

	async getMappedContacts() {
		const contacts = (await this.whatsapp.getClient().getContacts())
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

	async getGroupContacts(groupChat: GroupChat, contacts: MappedContacts) {
		const group_participants = groupChat.participants.map(async (participant) => {
			const contact = contacts[participant.id.user];
			let name = contact ? contact.name : undefined;
			let country = contact ? contact.country : undefined;
			let isBusiness = contact ? contact.isBusiness : false;
			let public_name = contact ? contact.public_name : undefined;
			if (!contact) {
				const fetchedContact = await this.whatsapp
					.getClient()
					.getContactById(participant.id._serialized);
				name = fetchedContact.name ?? '';
				const country_code = await fetchedContact.getCountryCode();
				country = COUNTRIES[country_code as string];
				isBusiness = fetchedContact.isBusiness;
				public_name = fetchedContact.pushname;
			}

			return {
				name: name,
				number: participant.id.user,
				country: country,
				isBusiness: isBusiness ? 'Business' : 'Personal',
				user_type: participant.isSuperAdmin ? 'CREATOR' : participant.isAdmin ? 'ADMIN' : 'USER',
				group_name: groupChat.name,
				public_name: public_name,
			};
		});
		return await Promise.all(group_participants);
	}

	async getContactsByLabel(label_id: string) {
		const chats = await this.whatsapp.getClient().getChatsByLabelId(label_id);
		const label = await this.whatsapp.getClient().getLabelById(label_id);
		const contactsPromises = chats
			.map(async (chat) => {
				if (chat.isGroup) {
					const participants = (chat as GroupChat).participants.map(async (participant) => {
						const contact = await this.whatsapp
							.getClient()
							.getContactById(participant.id._serialized);
						const country_code = await contact.getCountryCode();
						const country = COUNTRIES[country_code as string];
						return {
							name: contact.name ?? '',
							number: contact.number,
							country: country ?? '',
							isBusiness: contact.isBusiness ? 'Business' : 'Personal',
							public_name: contact.pushname ?? '',
							group_name: chat.name,
							label: label.name,
						};
					});
					return await Promise.all(participants);
				} else {
					const contact = await this.whatsapp.getClient().getContactById(chat.id._serialized);
					const country_code = await contact.getCountryCode();
					const country = COUNTRIES[country_code as string];
					return [
						{
							name: contact.name ?? '',
							number: contact.number,
							country: country ?? '',
							isBusiness: contact.isBusiness ? 'Business' : 'Personal',
							public_name: contact.pushname ?? '',
							group_name: chat.name,
							label: label.name,
						},
					];
				}
			})
			.flat();

		const arraysOfContacts = await Promise.all(contactsPromises);
		const flatContactsArray = arraysOfContacts.flat();
		return flatContactsArray;
	}

	static async removeUnwantedSessions() {
		const sessions = await UserService.getRevokedSessions();
		for (const session of sessions) {
			await WhatsappProvider.getInstance(session.client_id).logoutClient();
			WhatsappUtils.deleteSession(session.client_id);
			session.remove();
		}
		Logger.info('WHATSAPP-CLEANER', `Removed ${sessions.length} unwanted sessions`);
	}

	static async removeInactiveSessions() {
		const sessions = await UserService.getInactiveSessions();
		for (const session of sessions) {
			WhatsappProvider.getInstance(session.client_id).logoutClient();
		}
		Logger.info('WHATSAPP-CLEANER', `Removed ${sessions.length} inactive sessions`);
	}

	static deleteSession(client_id: string) {
		WhatsappProvider.deleteSession(client_id);
		const path = __basedir + '/.wwebjs_auth/session-' + client_id;
		const dataExists = fs.existsSync(path);
		if (dataExists) {
			fs.rmSync(path, {
				recursive: true,
			});
		}
	}

	static async resumeSessions() {
		if (!IS_PRODUCTION) return;
		const path = __basedir + '/.wwebjs_auth';
		if (!fs.existsSync(path)) {
			return;
		}
		const client_ids = (await fs.promises.readdir(path, { withFileTypes: true }))
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name.split('session-')[1]);

		const valid_sessions_promises = client_ids.map(async (client_id) => {
			const [isValidAuth] = await UserService.isValidAuth(client_id);
			if (isValidAuth) {
				return client_id;
			}
			return null;
		});

		const active_client_ids = (await Promise.all(valid_sessions_promises)).filter(
			(client_id) => client_id !== null
		) as string[];

		active_client_ids.forEach((client_id) => {
			const instance = WhatsappProvider.getInstance(client_id);
			instance.initialize();

			setTimeout(() => {
				if (instance.isReady()) {
					return;
				}
				instance.destroyClient();
				WhatsappUtils.deleteSession(client_id);
				UserService.logout(client_id);
			}, SESSION_STARTUP_WAIT_TIME);
		});
	}
}
