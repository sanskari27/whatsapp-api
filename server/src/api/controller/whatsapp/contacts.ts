import { NextFunction, Request, Response } from 'express';
import { SocketServerProvider } from '../../../socket';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { COUNTRIES } from '../../../config/const';
import { Respond } from '../../../utils/ExpressUtils';
import WAWebJS from 'whatsapp-web.js';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';

async function contacts(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const options = {
		all_contacts: true,
		saved_contacts: false,
	};
	if (req.query.saved_contacts && req.query.saved_contacts === 'true') {
		options.all_contacts = false;
		options.saved_contacts = true;
	} else if (req.query.non_saved_contacts && req.query.non_saved_contacts === 'true') {
		options.all_contacts = false;
		options.saved_contacts = false;
	}

	try {
		const contacts = [] as WAWebJS.Contact[];

		const saved = await WhatsappProvider.getSavedContacts(whatsapp);
		const non_saved = await WhatsappProvider.getNonSavedContacts(whatsapp);
		if (options.all_contacts) {
			contacts.push(...saved, ...non_saved);
		} else if (options.saved_contacts) {
			contacts.push(...saved);
		} else {
			contacts.push(...non_saved);
		}

		const results = contacts.map(async (contact) => {
			const country_code = await contact.getCountryCode();
			const country = COUNTRIES[country_code as string];
			return {
				name: contact.name,
				number: contact.number,
				isBusiness: contact.isBusiness ? 'Business' : 'Personal',
				country,
				public_name: contact.pushname ?? '',
			};
		});

		return Respond({
			res,
			status: 200,
			data: { contacts: await Promise.all(results) },
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function countContacts(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const saved = await WhatsappProvider.getSavedContacts(whatsapp);
		const non_saved = await WhatsappProvider.getNonSavedContacts(whatsapp);

		return Respond({
			res,
			status: 200,
			data: {
				saved_contacts: saved.length,
				non_saved_contacts: non_saved.length,
				total_contacts: saved.length + non_saved.length,
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

const ContactsController = {
	getContacts: contacts,
	countContacts,
};

export default ContactsController;
