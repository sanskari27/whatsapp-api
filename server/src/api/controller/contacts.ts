import { NextFunction, Request, Response } from 'express';
import { SocketServerProvider } from '../../socket';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import { Respond } from '../../utils/ExpressUtils';

export default async function (req: Request, res: Response, next: NextFunction) {
	const { client_id } = req.params;

	const whatsapp = SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.USER_NOT_FOUND_ERROR));
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

			.map((contact) => ({
				name: contact.name,
				number: contact.number,
			}));

		return Respond({
			res,
			status: 200,
			data: { contacts },
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.USER_NOT_FOUND_ERROR));
	}
}
