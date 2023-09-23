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
	const { group_id } = req.params;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const contacts = await WhatsappProvider.getMappedContacts(whatsapp);

		const chat = await whatsapp.getChatById(group_id);

		if (!chat || !chat.isGroup) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
		}
		const groupChat = chat as GroupChat;

		const participants = groupChat.participants.map(async (participant) => {
			const contact = contacts[participant.id.user];
			let name = contact ? contact.name : undefined;
			let country = contact ? contact.country : undefined;
			let isBusiness = contact ? contact.isBusiness : false;
			if (!contact) {
				const fetchedContact = await whatsapp.getContactById(participant.id._serialized);
				name = fetchedContact.pushname;
				const country_code = await fetchedContact.getCountryCode();
				country = COUNTRIES[country_code as string];
				isBusiness = fetchedContact.isBusiness;
			}

			return {
				name: name,
				number: participant.id.user,
				country: country,
				isBusiness: isBusiness,
				user_type: participant.isSuperAdmin ? 'CREATOR' : participant.isAdmin ? 'ADMIN' : 'USER',
				group_name: groupChat.name,
			};
		});

		return Respond({
			res,
			status: 200,
			data: {
				id: groupChat.id.user,
				name: groupChat.name,
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
