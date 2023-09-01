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

	const saved_contacts = req.query.saved_contacts === 'true';

	try {
		const contacts = (await whatsapp.getContacts())
			.filter((contact) => {
				if (!contact.isWAContact || contact.isMe || contact.isGroup) {
					return false;
				}
				if (saved_contacts && !contact.isMyContact) {
					return false;
				} else if (!saved_contacts && contact.isMyContact) {
					return false;
				}
				return true;
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
