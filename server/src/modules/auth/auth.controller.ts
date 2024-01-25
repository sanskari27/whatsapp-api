import { NextFunction, Request, Response } from 'express';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { UserService } from '../../services';
import { Respond } from '../../utils/ExpressUtils';

async function validateClientID(req: Request, res: Response, next: NextFunction) {
	const client_id = req.headers['client-id'] as string;
	if (!client_id) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const authStatus = await UserService.isValidAuth(client_id);
	const whatsapp = WhatsappProvider.getInstance(client_id);

	if (!authStatus.valid) {
		if (client_id) {
			whatsapp.logoutClient();
		}
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	return Respond({
		res,
		status: 200,
		data: {
			session_expires_at: authStatus.revoke_at,
			isWhatsappReady: whatsapp.isReady(),
		},
	});
}

async function details(req: Request, res: Response, next: NextFunction) {
	const userService = new UserService(req.locals.user);
	const paymentRecords = await userService.getPaymentRecords();
	const { isSubscribed, isNew } = userService.isSubscribed();

	return Respond({
		res,
		status: 200,
		data: {
			name: userService.getName(),
			phoneNumber: userService.getPhoneNumber(),
			isSubscribed: isSubscribed,
			canSendMessage: isSubscribed || isNew,
			subscriptionExpiration: isSubscribed ? userService.getExpiration('DD/MM/YYYY') : '',
			userType: userService.getUserType(),
			paymentRecords: paymentRecords,
		},
	});
}

async function logout(req: Request, res: Response, next: NextFunction) {
	WhatsappProvider.getInstance(req.locals.client_id).logoutClient();

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
