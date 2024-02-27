import fs from 'fs';
import Logger from 'n23-logger';
import WAWebJS, { BusinessContact, Contact, GroupChat } from 'whatsapp-web.js';
import { COUNTRIES, IS_PRODUCTION, SESSION_STARTUP_WAIT_TIME } from '../config/const';
import InternalError, { INTERNAL_ERRORS } from '../errors/internal-errors';
import { WhatsappProvider } from '../provider/whatsapp_provider';
import { UserService } from '../services';
import {
	GroupDetails,
	TBusinessContact,
	TContact,
	TGroupBusinessContact,
	TGroupContact,
	TLabelBusinessContact,
	TLabelContact,
} from '../types/whatsapp';

type MappedContact_ReturnType<T extends boolean> = T extends true
	? {
			[contact_number: string]: TBusinessContact;
	  }
	: {
			[contact_number: string]: TContact;
	  };

export type MappedContacts = {
	[contact_number: string]: {
		name: string;
		public_name: string;
		number: string;
		isBusiness: 'Business' | 'Personal';
		country: string;
		description: string;
		email: string;
		websites: string[];
		latitude: number;
		longitude: number;
		address: string;
	};
};

export default class WhatsappUtils {
	private whatsapp: WhatsappProvider;
	constructor(whatsapp: WhatsappProvider) {
		this.whatsapp = whatsapp;
	}

	async getNumberIds(numbers: string[]) {
		const numbersPromise = numbers.map(async (number) => {
			try {
				const numberID = await this.whatsapp.getClient().getNumberId(number);
				if (!numberID) {
					return null;
				}
				return numberID._serialized;
			} catch (err) {
				return null;
			}
		});

		return (await Promise.all(numbersPromise)).filter((number) => number !== null) as string[];
	}

	async getNumberWithId(number: string) {
		const number_ids = await this.getNumberWithIds([number]);
		return number_ids.length > 0 ? number_ids[0] : null;
	}

	async getNumberWithIds(numbers: string[]) {
		const numbersPromise = numbers.map(async (number) => {
			try {
				const numberID = await this.whatsapp.getClient().getNumberId(number);
				if (!numberID) {
					return null;
				}
				return {
					number,
					numberId: numberID._serialized,
				};
			} catch (err) {
				return null;
			}
		});

		return (await Promise.all(numbersPromise)).filter((number) => number !== null) as {
			number: string;
			numberId: string;
		}[];
	}

	async getChat(id: string) {
		try {
			const chat = await this.whatsapp.getClient().getChatById(id);
			if (!chat) return null;
			return chat;
		} catch (err) {
			return null;
		}
	}

	async getChatIds(ids: string | string[]) {
		const searchable_ids = typeof ids === 'string' ? [ids] : ids;
		return (
			await Promise.all(
				searchable_ids.map(async (id) => {
					const chat = await this.getChat(id);
					return chat ? chat.id._serialized : null;
				})
			)
		).filter((chat) => chat) as string[];
	}

	async getParticipantsChatByGroup(group_id: string) {
		const chat = await this.getChat(group_id);
		if (!chat || !chat.isGroup) {
			throw new InternalError(INTERNAL_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID);
		}

		return (chat as GroupChat).participants.map((participant) => participant.id._serialized);
	}

	async getChatIdsByLabel(label_id: string) {
		if (!this.whatsapp.isBusiness()) {
			throw new InternalError(INTERNAL_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED);
		}
		const chats = await this.whatsapp.getClient().getChatsByLabelId(label_id);

		return chats.map((chat) => chat.id._serialized);
	}

	async getContacts() {
		const saved_contacts = (await this.whatsapp.getClient().getContacts()).filter(
			(contact) => contact.isMyContact && !contact.isMe && !contact.isGroup && contact.isWAContact
		);
		const chats = await this.whatsapp.getClient().getChats();

		const { non_saved_contacts, saved_chat, groups } = await chats.reduce(
			async (accP, chat) => {
				const acc = await accP;
				if (chat.isGroup) {
					acc.groups.push({
						id: (chat as GroupChat).id._serialized,
						name: (chat as GroupChat).name ?? '',
						isMergedGroup: false,
						participants: (chat as GroupChat).participants.length,
					} as GroupDetails);
					return acc;
				}
				const contact = await this.whatsapp.getClient().getContactById(chat.id._serialized);
				if (!contact.isMyContact && !contact.isMe) {
					acc.non_saved_contacts.push(contact);
				} else if (contact.isMyContact && !contact.isMe) {
					acc.saved_chat.push(contact);
				}
				return acc;
			},
			Promise.resolve({
				non_saved_contacts: [] as WAWebJS.Contact[],
				saved_chat: [] as WAWebJS.Contact[],
				groups: [] as GroupDetails[],
			})
		);

		return { saved: saved_contacts, non_saved: non_saved_contacts, saved_chat: saved_chat, groups };
	}

	async getContactDetails(contact: WAWebJS.Contact) {
		let country_code = '';
		if (Object.hasOwnProperty('getCountryCode')) {
			country_code = await contact.getCountryCode();
		} else if (Object.hasOwnProperty('number')) {
			country_code = await this.whatsapp.getClient().getCountryCode(contact.number);
		}
		const country = COUNTRIES[country_code as string];
		return {
			name: contact.name,
			number: contact.number,
			isBusiness: (contact.isBusiness ? 'Business' : 'Personal') as 'Business' | 'Personal',
			country,
			public_name: contact.pushname ?? '',
		};
	}
	static getBusinessDetails(contact: Contact) {
		const business_contact = contact as BusinessContact;
		const business_details = business_contact.businessProfile as {
			description: string;
			email: string;
			website: string[];
			latitude: number;
			longitude: number;
			address: string;
		};

		return {
			description: business_details?.description ?? '',
			email: business_details?.email ?? '',
			websites: business_details?.website ?? [],
			latitude: business_details?.latitude ?? 0,
			longitude: business_details?.longitude ?? 0,
			address: business_details?.address ?? '',
		};
	}

	async contactsWithCountry<T extends boolean>(
		contacts: WAWebJS.Contact[],
		options: {
			business_details: T;
		} = {
			business_details: false as T,
		}
	): Promise<T extends true ? TBusinessContact[] : TContact[]> {
		const detailed_contacts = await Promise.all(
			contacts.map(async (contact) => {
				const contact_details = (await this.getContactDetails(contact)) as TContact;
				if (!options.business_details) {
					return contact_details;
				}
				if (!contact.isBusiness) {
					return null;
				}
				const business_details = WhatsappUtils.getBusinessDetails(contact as BusinessContact);

				return {
					...contact_details,
					...business_details,
				} as TBusinessContact;
			})
		);

		const valid_contacts = detailed_contacts.filter((contact) => contact !== null);

		return valid_contacts as T extends true ? TBusinessContact[] : TContact[];
	}

	async getMappedContacts<T extends boolean>(
		business_contacts_only: T = false as T
	): Promise<MappedContact_ReturnType<T>> {
		const filtered_contacts = (await this.whatsapp.getClient().getContacts())
			.filter((contact) => contact.isMyContact && contact.name && contact.number)
			.filter((contact) => {
				if (!business_contacts_only) {
					return true;
				}
				return contact.isBusiness;
			});
		const contacts = await Promise.all(
			filtered_contacts.map(async (contact) => {
				const contact_details = await this.getContactDetails(contact);
				if (!business_contacts_only) {
					return contact_details as TContact;
				} else {
					const business_details = WhatsappUtils.getBusinessDetails(contact as BusinessContact);
					return {
						...(contact_details as Partial<TContact>),
						...(business_details as Partial<TBusinessContact>),
					} as TBusinessContact;
				}
			})
		);
		const mapped_contacts = contacts.reduce(
			(acc, contact) => {
				acc[contact.number] = contact;
				return acc;
			},
			{} as T extends true
				? {
						[contact_number: string]: TBusinessContact;
				  }
				: {
						[contact_number: string]: TContact;
				  }
		);

		return mapped_contacts;
	}

	async getGroupContacts<T extends boolean>(
		groupChat: GroupChat,
		options: {
			business_details?: T;
			mapped_contacts: MappedContacts;
		}
	): Promise<T extends true ? TGroupBusinessContact[] : TGroupContact[]> {
		const contacts = options.mapped_contacts;

		const group_participants = await Promise.all(
			groupChat.participants.map(async (participant) => {
				const contact = contacts[participant.id.user];

				const contact_details: TGroupContact = {
					group_id: groupChat.id._serialized.split('@')[0],
					name: contact ? contact.name : '',
					number: participant.id.user,
					country: contact ? contact.country : '',
					isBusiness: contact ? contact.isBusiness : 'Personal',
					public_name: contact ? contact.public_name : '',
					group_name: groupChat.name,
					user_type: participant.isSuperAdmin ? 'CREATOR' : participant.isAdmin ? 'ADMIN' : 'USER',
				};
				let fetchedContact: WAWebJS.Contact | null = null;

				if (!contact) {
					fetchedContact = await this.whatsapp
						.getClient()
						.getContactById(participant.id._serialized);
					contact_details.name = fetchedContact.name ?? '';
					const country_code = await fetchedContact.getCountryCode();
					contact_details.country = COUNTRIES[country_code as string];
					contact_details.isBusiness = fetchedContact.isBusiness ? 'Business' : 'Personal';
					contact_details.public_name = fetchedContact.pushname;
				}

				if (!options.business_details) {
					return contact_details;
				}

				if (contact_details.isBusiness !== 'Business') {
					return null;
				}

				if (!fetchedContact) {
					fetchedContact = await this.whatsapp
						.getClient()
						.getContactById(participant.id._serialized);
				}

				const business_details = WhatsappUtils.getBusinessDetails(
					fetchedContact as BusinessContact
				);
				return {
					...(contact_details as Partial<TGroupContact>),
					...(business_details as Partial<TGroupBusinessContact>),
				} as TGroupBusinessContact;
			})
		);

		return group_participants.filter((participant) => participant !== null) as T extends true
			? TGroupBusinessContact[]
			: TGroupContact[];
	}

	async getContactsByLabel<T extends boolean>(
		label_id: string,
		options: {
			business_details?: boolean;
			mapped_contacts: MappedContacts;
		}
	) {
		try {
			const chats = await this.whatsapp.getClient().getChatsByLabelId(label_id);
			const label = await this.whatsapp.getClient().getLabelById(label_id);
			const contactsPromises = chats
				.map(async (chat) => {
					if (chat.isGroup) {
						const participants = await this.getGroupContacts(chat as GroupChat, {
							business_details: options.business_details,
							mapped_contacts: options.mapped_contacts,
						});

						return participants.map((participant) => ({
							...participant,
							group_name: chat.name,
							label: label.name,
						})) as (TLabelContact | TLabelBusinessContact)[];
					} else {
						const contact = await this.whatsapp.getClient().getContactById(chat.id._serialized);
						const contacts_details = await this.getContactDetails(contact);
						if (!options.business_details) {
							return [
								{
									...contacts_details,
									group_name: chat.name,
									label: label.name,
								} as TLabelContact,
							];
						}
						if (!contact.isBusiness) {
							return [];
						}
						const business_details = WhatsappUtils.getBusinessDetails(contact as BusinessContact);
						return [
							{
								...contacts_details,
								...business_details,
								group_name: chat.name,
								label: label.name,
							} as TLabelBusinessContact,
						];
					}
				})
				.flat();

			const arraysOfContacts = await Promise.all(contactsPromises);
			const flatContactsArray = arraysOfContacts.flat();
			return flatContactsArray;
		} catch (error) {
			return [];
		}
	}

	async createGroup(title: string, participants: string[]) {
		await this.whatsapp.getClient().createGroup(title, participants, {
			autoSendInviteV4: true,
		});
	}

	static async removeUnwantedSessions() {
		const sessions = await UserService.getRevokedSessions();
		for (const session of sessions) {
			WhatsappProvider.getInstance(session.client_id).logoutClient();
			const session_deleted = WhatsappUtils.deleteSession(session.client_id);
			if (session_deleted) {
				session.session_cleared = true;
				session.save();
			}
		}
		Logger.info('WHATSAPP-HELPER', `Removed ${sessions.length} unwanted sessions`);
	}

	static async removeInactiveSessions() {
		const sessions = await UserService.getInactiveSessions();
		for (const session of sessions) {
			WhatsappProvider.getInstance(session.client_id).destroyClient();
		}
		Logger.info('WHATSAPP-HELPER', `Removed ${sessions.length} inactive sessions`);
	}

	static deleteSession(client_id: string) {
		WhatsappProvider.deleteSession(client_id);
		const path = __basedir + '/.wwebjs_auth/session-' + client_id;
		const dataExists = fs.existsSync(path);
		if (dataExists) {
			fs.rmSync(path, {
				recursive: true,
			});
			return true;
		}
		return false;
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
		const inactive_client_ids = (await UserService.getInactiveSessions()).map(
			(session) => session.client_id
		);

		const valid_sessions_promises = client_ids.map(async (client_id) => {
			const { valid } = await UserService.isValidAuth(client_id);
			if (valid && !inactive_client_ids.includes(client_id)) {
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

		Logger.info('WHATSAPP-HELPER', `Started ${active_client_ids.length} client sessions`);
	}
}
