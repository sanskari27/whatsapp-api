import { NextFunction, Request, Response } from 'express';
import { SocketServerProvider } from '../../socket';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import { Respond } from '../../utils/ExpressUtils';
import { GroupChat } from 'whatsapp-web.js';

export default async function (req: Request, res: Response, next: NextFunction) {
	const { client_id } = req.params;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.USER_NOT_FOUND_ERROR));
	}

	try {
		const contacts = (await whatsapp.getContacts())
			.filter((contact) => contact.isMyContact && contact.name && contact.number)
			.reduce((acc, contact) => {
				acc[contact.number] = contact.name as string;
				return acc;
			}, {} as { [number: string]: string });

		const groups = (await whatsapp.getChats())
			.filter((chat) => chat.isGroup)
			.map((chat) => {
				const groupChat = chat as GroupChat;
				return {
					name: groupChat.name,
					participants: groupChat.participants.map((participant) => ({
						name: contacts[participant.id.user] ?? 'Unknown',
						number: participant.id.user,
					})),
				};
			});

		return Respond({
			res,
			status: 200,
			data: { groups },
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.USER_NOT_FOUND_ERROR));
	}
}
