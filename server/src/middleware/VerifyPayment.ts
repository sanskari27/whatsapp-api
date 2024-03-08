import { NextFunction, Request, Response } from 'express';
import { APIError, PAYMENT_ERRORS } from '../errors';
import { AccountService } from '../services/account';

export async function isSubscribed(req: Request, res: Response, next: NextFunction) {
	try {
		const { isSubscribed } = await new AccountService(req.locals.account).isSubscribed(
			req.locals.device._id
		);

		if (!isSubscribed) {
			return next(new APIError(PAYMENT_ERRORS.PAYMENT_REQUIRED));
		}

		next();
	} catch (e: unknown) {
		return next(new APIError(PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}
}

export async function isPseudoSubscribed(req: Request, res: Response, next: NextFunction) {
	try {
		const { isSubscribed, isNew } = await new AccountService(req.locals.account).isSubscribed(
			req.locals.device._id
		);
		if (isSubscribed || isNew) {
			return next();
		}

		return next(new APIError(PAYMENT_ERRORS.PAYMENT_REQUIRED));
	} catch (e: unknown) {
		return next(new APIError(PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}
}

const PaymentValidator = {
	isSubscribed,
	isPseudoSubscribed,
};

export default PaymentValidator;
