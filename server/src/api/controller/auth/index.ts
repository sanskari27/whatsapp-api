import { NextFunction, Request, Response } from 'express';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { PaymentService, UserService } from '../../../database/services';
import { SocketServerProvider } from '../../../socket';
import DateUtils from '../../../utils/DateUtils';

async function validateClientID(req: Request, res: Response, next: NextFunction) {
	const client_id = req.headers['client-id'] as string;

	const [isValidAuth, revoke_at] = await UserService.isValidAuth(client_id);

	if (!isValidAuth) {
		WhatsappProvider.logoutClient(client_id);
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	return Respond({
		res,
		status: 200,
		data: {
			session_expires_at: revoke_at,
		},
	});
}

async function details(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = await SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
	const paymentService = new PaymentService(req.locals.user);
	const currentPayment = await paymentService.getRunningPayment();
	const paymentRecords = await paymentService.getPaymentRecords();

	const contact = await whatsapp.getContactById(whatsapp.info.wid._serialized);

	return Respond({
		res,
		status: 200,
		data: {
			name: whatsapp.info.pushname,
			phoneNumber: whatsapp.info.wid.user,
			isSubscribed: currentPayment !== null,
			subscriptionExpiration: currentPayment
				? DateUtils.getMoment(currentPayment.expires_at).format('DD/MM/YYYY')
				: '',
			userType: contact.isBusiness ? 'BUSINESS' : 'PERSONAL',
			paymentRecords: paymentRecords.map((payment) => ({
				date: DateUtils.getMoment(payment.transaction_date).format('DD/MM/YYYY'),
				amount: payment.total_amount,
			})),
		},
	});
}

async function logout(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = await SocketServerProvider.getWhatsappClient(client_id);
	if (!whatsapp) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	await WhatsappProvider.logoutClient(client_id);
	WhatsappProvider.destroyClient(whatsapp);

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
