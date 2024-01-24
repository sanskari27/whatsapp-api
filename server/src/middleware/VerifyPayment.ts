import { NextFunction, Request, Response } from 'express';
import APIError, { API_ERRORS } from '../errors/api-errors';
import { UserService } from '../services';

export async function isSubscribed(req: Request, res: Response, next: NextFunction) {
	try {
		const { isSubscribed } = new UserService(req.locals.user).isSubscribed();

		if (!isSubscribed) {
			return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
		}

		next();
	} catch (e: unknown) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}
}

export async function isPseudoSubscribed(req: Request, res: Response, next: NextFunction) {
	try {
		const { isSubscribed, isNew } = new UserService(req.locals.user).isSubscribed();
		if (isSubscribed) {
			return next();
		}

		if (isNew) {
			return next();
		}

		return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
	} catch (e: unknown) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}
}

const PaymentValidator = {
	isSubscribed,
	isPseudoSubscribed,
};

export default PaymentValidator;
