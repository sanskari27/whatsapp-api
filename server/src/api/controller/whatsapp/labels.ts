import { NextFunction, Request, Response } from 'express';
import IContact from '../../../types/whatsapp/contact';
import { SocketServerProvider } from '../../../socket';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { GroupChat } from 'whatsapp-web.js';

type Chat = IContact & {
	group_name?: string;
	label?: string;
};

async function labels(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const labels = await whatsapp.getLabels();

		return Respond({
			res,
			status: 200,
			data: {
				labels: labels.map((label) => ({
					name: label.name,
					id: label.id,
				})),
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function exportLabels(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const { label: label_id } = req.params;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const contacts = await WhatsappProvider.getMappedContacts(whatsapp);

		const chats = await whatsapp.getChatsByLabelId(label_id);
		const label = await whatsapp.getLabelById(label_id);
		const entries: {
			[label: string]: Chat;
		} = {};

		for (const chat of chats) {
			if (chat.isGroup) {
				for (const participant of (chat as GroupChat).participants) {
					if (entries[participant.id.user]) {
						continue;
					}
					const contact = contacts[participant.id.user];

					entries[participant.id.user] = {
						...contact,
						group_name: chat.name,
						label: label.name,
					};
				}
			} else {
				if (entries[chat.id.user]) {
					continue;
				}
				const contact = contacts[chat.id.user];

				entries[chat.id.user] = {
					...contact,
					group_name: '',
					label: label.name,
				};
			}
		}

		return Respond({
			res,
			status: 200,
			data: { name: label.name, entries },
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

const LabelsController = {
	labels,
	exportLabels,
};

export default LabelsController;
