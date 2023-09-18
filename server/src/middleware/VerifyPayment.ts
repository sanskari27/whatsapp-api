import { NextFunction, Request, Response } from 'express';
import { Locals } from '../types';
import APIError, { API_ERRORS } from '../errors/api-errors';
import { UserService } from '../database/services';
import { WhatsappProvider } from '../provider/whatsapp_provider';

export default async function VerifyPayment(req: Request, res: Response, next: NextFunction) {
	const client_id = req.headers['client-id'] as string;

	if (!client_id) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}

	try {
		const [isValidAuth] = await UserService.isValidAuth(client_id);

		if (!isValidAuth) {
			WhatsappProvider.removeClient(client_id);
			return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
		}

		req.locals = {
			client_id,
		} as Locals;

		res.locals = {
			client_id,
		} as Locals;

		next();
	} catch (e: unknown) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}
}
