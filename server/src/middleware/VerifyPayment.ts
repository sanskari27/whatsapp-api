import { NextFunction, Request, Response } from 'express';
import { APIError, PAYMENT_ERRORS } from '../errors';

export async function isSubscribed(req: Request, res: Response, next: NextFunction) {
	try {
		const { isSubscribed } = await req.locals.account.isSubscribed();

		if (!isSubscribed) {
			return next(new APIError(PAYMENT_ERRORS.PAYMENT_REQUIRED));
		}

		next();
	} catch (e: unknown) {
		return next(new APIError(PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}
}

const PaymentValidator = {
	isSubscribed,
};

export default PaymentValidator;
