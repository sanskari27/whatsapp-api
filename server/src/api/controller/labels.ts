import { NextFunction, Request, Response } from 'express';
import { SocketServerProvider } from '../../socket';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import { Respond } from '../../utils/ExpressUtils';
import { GroupChat as WWGroupChat } from 'whatsapp-web.js';
type Contact = {
	name: string;
	number: string;
};

type PrivateChat = Contact & {
	isGroup: false;
};

type GroupChat = {
	isGroup: true;
	name: string;
	participants: Contact[];
};

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

		const chats = await whatsapp.getChats();
		const label_map: {
			[label: string]: (PrivateChat | GroupChat)[];
		} = {};

		for (const chat of chats) {
			const labels = await chat.getLabels();

			for (const label of labels) {
				if (!label_map[label.name]) {
					label_map[label.name] = [];
				}

				if (chat.isGroup) {
					const groupChat = chat as WWGroupChat;
					label_map[label.name].push({
						isGroup: true,
						name: groupChat.name,
						participants: groupChat.participants.map((participant) => ({
							name: contacts[participant.id.user] ?? 'Unknown',
							number: participant.id.user,
						})),
					});
				} else {
					label_map[label.name].push({
						isGroup: false,
						name: contacts[chat.id.user],
						number: chat.id.user,
					});
				}
			}
		}

		return Respond({
			res,
			status: 200,
			data: { label_map },
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.USER_NOT_FOUND_ERROR));
	}
}
