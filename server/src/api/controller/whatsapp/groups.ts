import { NextFunction, Request, Response } from 'express';
import { SocketServerProvider } from '../../../socket';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
import { GroupChat } from 'whatsapp-web.js';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';

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
					id: groupChat.id.user,
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

		const groupChat = (await whatsapp.getChatById(group_id)) as GroupChat;
		if (!groupChat || !groupChat.isGroup) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
		}

		return Respond({
			res,
			status: 200,
			data: {
				id: groupChat.id.user,
				name: groupChat.name,
				participants: groupChat.participants.map((participant) => {
					const contact = contacts[participant.id.user];

					return {
						name: contact.name,
						number: contact.number,
						country: contact.country,
						isBusiness: contact.isBusiness,
						user_type: participant.isSuperAdmin
							? 'CREATOR'
							: participant.isAdmin
							? 'ADMIN'
							: 'USER',
						group_name: groupChat.name,
					};
				}),
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

const GroupsController = {
	groups,
	exportGroups,
};

export default GroupsController;
