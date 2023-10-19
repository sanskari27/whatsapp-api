import WAWebJS, { GroupChat } from 'whatsapp-web.js';
import { COUNTRIES } from '../config/const';
import APIError, { API_ERRORS } from '../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../errors/internal-errors';
import { WhatsappProvider } from '../provider/whatsapp_provider';
import { IContact } from '../types/whatsapp';

type MappedContacts = {
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
}
