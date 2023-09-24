import { NextFunction, Request, Response } from 'express';
import APIError, { API_ERRORS } from '../errors/api-errors';
import { PaymentService } from '../database/services';

export default async function VerifyPayment(req: Request, res: Response, next: NextFunction) {
	try {
		const isPaymentValid = await PaymentService.isPaymentValid(req.locals.user);

		if (!isPaymentValid) {
			// WhatsappProvider.removeClient(client_id);
			// return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
		}

		next();
	} catch (e: unknown) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}
}
