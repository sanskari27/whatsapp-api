import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AccessLevel } from '../../config/const';
import APIError from '../../errors/api-errors';

export type LoginValidationResult = {
	username: string;
	password: string;
	access_level: AccessLevel;
};

export async function AdminLoginValidator(req: Request, res: Response, next: NextFunction) {
	const validator = z.object({
		username: z.string(),
		password: z.string(),
		access_level: z.enum([AccessLevel.User, AccessLevel.Admin]).default(AccessLevel.User),
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
			MESSAGE: 'Invalid username, password or access_level.',
		})
	);
}
