import { NextFunction, Request, Response } from 'express';
import APIError, { API_ERRORS } from '../errors/api-errors';
import { UserService } from '../services';
import { Locals } from '../types';

export default async function VerifyClientID(req: Request, res: Response, next: NextFunction) {
	const client_id = req.headers['client-id'] as string;

	if (!client_id) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}

	try {
		const { valid, user } = await UserService.isValidAuth(client_id);

		if (!valid) {
			return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
		}

		req.locals = {
			client_id,
			user,
		} as Locals;

		res.locals = {
			client_id,
		} as Locals;

		next();
	} catch (e: unknown) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}
}
