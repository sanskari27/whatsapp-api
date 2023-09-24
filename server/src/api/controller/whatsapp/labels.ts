import { NextFunction, Request, Response } from 'express';
import { SocketServerProvider } from '../../../socket';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { GroupChat } from 'whatsapp-web.js';
import { COUNTRIES } from '../../../config/const';

type Chat = {
	name: string;
	number: string;
	country: string;
	isBusiness: string;
	public_name: string;
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
	const { label_ids } = req.query;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const contacts = await WhatsappProvider.getMappedContacts(whatsapp);

		const entries: {
			[label: string]: Chat;
		} = {};

		const label_ids_array = (label_ids as string).split(',');

		for (const label_id of label_ids_array) {
			const chats = await whatsapp.getChatsByLabelId(label_id);
			const label = await whatsapp.getLabelById(label_id);

			for (const chat of chats) {
				if (chat.isGroup) {
					for (const participant of (chat as GroupChat).participants) {
						if (entries[participant.id.user]) {
							continue;
						}
						const contact = contacts[participant.id.user];
						let name = contact ? contact.name : undefined;
						let number = contact ? contact.number : undefined;
						let country = contact ? contact.country : undefined;
						let isBusiness = contact ? contact.isBusiness : undefined;
						let public_name = contact ? contact.public_name : undefined;

						if (!contact) {
							const contact = await whatsapp.getContactById(participant.id._serialized);
							const country_code = await contact.getCountryCode();
							name = contact.name;
							number = contact.number;
							country = COUNTRIES[country_code as string];
							isBusiness = contact.isBusiness;
							public_name = contact.pushname;
						}

						entries[participant.id.user] = {
							name: name ?? '',
							number: number ?? '',
							country: country ?? '',
							isBusiness: isBusiness ? 'Business' : 'Personal',
							public_name: public_name ?? '',
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
						isBusiness: contact.isBusiness ? 'Business' : 'Personal',
						group_name: '',
						label: label.name,
					};
				}
			}
		}

		return Respond({
			res,
			status: 200,
			data: { entries: Object.values(entries) },
		});
	} catch (err) {
		console.log(err);

		return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
	}
}

const LabelsController = {
	labels,
	exportLabels,
};

export default LabelsController;
