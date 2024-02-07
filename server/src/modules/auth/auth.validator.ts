import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import APIError from '../../errors/api-errors';

export type AdminLoginValidationResult = {
	username: string;
	password: string;
};

export async function AdminLoginValidator(req: Request, res: Response, next: NextFunction) {
	const validator = z.object({
		username: z.string(),
		password: z.string(),
	});
	const validationResult = validator.safeParse(req.body);
	if (validationResult.success) {
		req.locals.data = validationResult.data;
		return next();
	}

	return next(
		new APIError({
			STATUS: 400,
			TITLE: 'INVALID_FIELDS',
			MESSAGE: 'Invalid username or password.',
		})
	);
}
