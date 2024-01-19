import { NextFunction, Request, Response } from 'express';
import { UserService } from '../../../database/services';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond } from '../../../utils/ExpressUtils';

async function validateClientID(req: Request, res: Response, next: NextFunction) {
	const client_id = req.headers['client-id'] as string;

	const [isValidAuth, revoke_at] = await UserService.isValidAuth(client_id);

	if (!isValidAuth) {
		if (client_id) {
			WhatsappProvider.getInstance(client_id).logoutClient();
		}
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
	const whatsapp = WhatsappProvider.getInstance(client_id);

	return Respond({
		res,
		status: 200,
		data: {
			session_expires_at: revoke_at,
			isWhatsappReady: whatsapp.isReady(),
		},
	});
}

async function details(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
	const userService = new UserService(req.locals.user);
	const paymentRecords = await userService.getPaymentRecords();
	const { isSubscribed, isNew } = userService.isSubscribed();

	const client = whatsapp.getClient();
	const contact = whatsapp.getContact();

	return Respond({
		res,
		status: 200,
		data: {
			name: client.info.pushname,
			phoneNumber: client.info.wid.user,
			isSubscribed: isSubscribed,
			canSendMessage: isSubscribed || isNew,
			subscriptionExpiration: isSubscribed ? userService.getExpiration().format('DD/MM/YYYY') : '',
			userType: contact.isBusiness ? 'BUSINESS' : 'PERSONAL',
			paymentRecords: paymentRecords,
		},
	});
}

async function logout(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);

	// await whatsapp.logoutClient();
	whatsapp.logoutClient();

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

const AuthController = {
	validateClientID,
	details,
	logout,
};

export default AuthController;
