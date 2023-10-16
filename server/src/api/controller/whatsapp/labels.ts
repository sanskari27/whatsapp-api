import { NextFunction, Request, Response } from 'express';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
import { COUNTRIES } from '../../../config/const';
import { GroupChat } from 'whatsapp-web.js';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';

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

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		if (!whatsapp.isBusiness()) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED));
		}
		const labels = await whatsapp.getClient().getLabels();

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

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const labelContacts: Chat[] = [];

		const label_ids_array = ((label_ids ?? '') as string).split(',');

		for (const label_id of label_ids_array) {
			const chats = await whatsapp.getClient().getChatsByLabelId(label_id);
			const label = await whatsapp.getClient().getLabelById(label_id);

			const contacts_in_label = chats
				.map((chat) => {
					if (chat.isGroup) {
						return (chat as GroupChat).participants.map((participant) => ({
							groupName: chat.name,
							contactId: participant.id._serialized,
						}));
					} else {
						return [
							{
								groupName: '',
								contactId: chat.id._serialized,
							},
						];
					}
				})
				.flat();

			const ww_contacts = await Promise.all(
				contacts_in_label.map(async ({ groupName, contactId }) => {
					const contact = await whatsapp.getClient().getContactById(contactId);
					return { groupName, contact };
				})
			);

			const contacts = ww_contacts.map(async ({ groupName, contact }) => {
				const country_code = await contact.getCountryCode();
				const country = COUNTRIES[country_code as string];
				return {
					name: contact.name ?? '',
					number: contact.number,
					country: country ?? '',
					isBusiness: contact.isBusiness ? 'Business' : 'Personal',
					public_name: contact.pushname ?? '',
					group_name: groupName,
					label: label.name,
				};
			});

			labelContacts.push(...(await Promise.all(contacts)));
		}

		return Respond({
			res,
			status: 200,
			data: { entries: labelContacts },
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
