import { NextFunction, Request, Response } from 'express';
import { SocketServerProvider } from '../../../socket';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { COUNTRIES } from '../../../config/const';
import { Respond } from '../../../utils/ExpressUtils';

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
		const contacts = (await whatsapp.getContacts())
			.filter((contact) => {
				if (!contact.isWAContact || contact.isMe || contact.isGroup) {
					return false;
				}
				if (options.all_contacts) {
					return true;
				}
				if (options.saved_contacts && contact.isMyContact) {
					return true;
				}
				if (!options.saved_contacts && !contact.isMyContact) {
					return true;
				}
				return false;
			})

			.map(async (contact) => {
				const country_code = await contact.getCountryCode();
				const country = COUNTRIES[country_code as string];
				return {
					name: contact.name,
					number: contact.number,
					isBusiness: contact.isBusiness,
					country,
				};
			});

		return Respond({
			res,
			status: 200,
			data: { contacts: await Promise.all(contacts) },
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

	const options = {
		all_contacts: true,
		saved_contacts: true,
	};
	if (req.query.saved_contacts) {
		options.all_contacts = false;
		options.saved_contacts = true;
	} else if (req.query.non_saved_contacts) {
		options.all_contacts = false;
		options.saved_contacts = false;
	}

	try {
		const contacts = (await whatsapp.getContacts()).reduce(
			(acc, contact) => {
				if (!contact.isWAContact || contact.isMe || contact.isGroup) {
					return acc;
				}
				if (contact.isMyContact) {
					acc.saved_contacts += 1;
				} else {
					acc.non_saved_contacts += 1;
				}
				return acc;
			},
			{
				saved_contacts: 0,
				non_saved_contacts: 0,
			}
		);

		return Respond({
			res,
			status: 200,
			data: {
				saved_contacts: contacts.saved_contacts,
				non_saved_contacts: contacts.non_saved_contacts,
				total_contacts: contacts.saved_contacts + contacts.non_saved_contacts,
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
