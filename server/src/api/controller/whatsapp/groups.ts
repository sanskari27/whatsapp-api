import { NextFunction, Request, Response } from 'express';
import { GroupChat } from 'whatsapp-web.js';
import { getOrCache } from '../../../config/cache';
import { CACHE_TOKEN_GENERATOR } from '../../../config/const';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond } from '../../../utils/ExpressUtils';
import WhatsappUtils, { MappedContacts } from '../../../utils/WhatsappUtils';

type GroupDetail = {
	id: string;
	name: string;
};

async function groups(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const groups = await getOrCache<GroupDetail[]>(
			CACHE_TOKEN_GENERATOR.GROUPS(client_id),
			async () => {
				const groups = (await whatsapp.getClient().getChats())
					.filter((chat) => chat.isGroup)
					.map((chat) => {
						const groupChat = chat as GroupChat;
						return {
							id: groupChat.id._serialized,
							name: groupChat.name,
						};
					});

				return groups;
			}
		);

		return Respond({
			res,
			status: 200,
			data: {
				groups,
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function exportGroups(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const { group_ids } = req.query;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	} else if (!group_ids || group_ids.length === 0) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	try {
		const contacts = await getOrCache<MappedContacts>(
			CACHE_TOKEN_GENERATOR.MAPPED_CONTACTS(client_id),
			async () => await whatsappUtils.getMappedContacts()
		);

		const group_ids_array = (group_ids as string).split(',');

		const groups = await Promise.all(
			group_ids_array.map(async (group_id) => {
				const chat = await whatsapp.getClient().getChatById(group_id);

				if (!chat || !chat.isGroup) {
					return null;
				}
				const groupChat = chat as GroupChat;
				return groupChat;
			})
		);

		const filtered_chats = groups.filter((chat) => chat !== null) as GroupChat[];

		const participants_promise = filtered_chats.map(async (groupChat) => {
			const group_participants = await getOrCache(
				CACHE_TOKEN_GENERATOR.GROUPS_EXPORT(client_id, groupChat.id._serialized),
				async () => await whatsappUtils.getGroupContacts(groupChat, contacts)
			);
			return group_participants;
		});

		return Respond({
			res,
			status: 200,
			data: {
				participants: await Promise.all(participants_promise),
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
