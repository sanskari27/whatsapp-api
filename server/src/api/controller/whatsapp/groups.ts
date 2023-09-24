import { NextFunction, Request, Response } from 'express';
import { SocketServerProvider } from '../../../socket';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
import { GroupChat } from 'whatsapp-web.js';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { COUNTRIES } from '../../../config/const';

async function groups(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const groups = (await whatsapp.getChats())
			.filter((chat) => chat.isGroup)
			.map((chat) => {
				const groupChat = chat as GroupChat;
				return {
					id: groupChat.id._serialized,
					name: groupChat.name,
				};
			});

		return Respond({
			res,
			status: 200,
			data: { groups },
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function exportGroups(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const { group_ids } = req.query;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const contacts = await WhatsappProvider.getMappedContacts(whatsapp);

		if (!group_ids || group_ids.length === 0) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
		}

		const group_ids_array = (group_ids as string).split(',');

		const groups = await Promise.all(
			group_ids_array.map(async (group_id) => {
				const chat = await whatsapp.getChatById(group_id);

				if (!chat || !chat.isGroup) {
					return null;
				}
				const groupChat = chat as GroupChat;
				return groupChat;
			})
		);

		const filtered_chats = groups.filter((chat) => chat !== null) as GroupChat[];

		const participants = [];

		for (const groupChat of filtered_chats) {
			const group_participants = groupChat.participants.map(async (participant) => {
				const contact = contacts[participant.id.user];
				let name = contact ? contact.name : undefined;
				let country = contact ? contact.country : undefined;
				let isBusiness = contact ? contact.isBusiness : false;
				let public_name = contact ? contact.public_name : undefined;
				if (!contact) {
					const fetchedContact = await whatsapp.getContactById(participant.id._serialized);
					name = fetchedContact.pushname;
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
			participants.push(...group_participants);
		}

		return Respond({
			res,
			status: 200,
			data: {
				participants: await Promise.all(participants),
			},
		});
	} catch (err) {
		console.log(err);

		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

const GroupsController = {
	groups,
	exportGroups,
};

export default GroupsController;
