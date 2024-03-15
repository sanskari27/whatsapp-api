import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { APIError } from '../errors';

export async function IDValidator(req: Request, res: Response, next: NextFunction) {
	const validator = z.string();
	const validationResult = validator.safeParse(req.params.id);
	if (validationResult.success) {
		req.locals.id = validationResult.data;
		return next();
	}

	return next(
		new APIError({
			STATUS: 400,
			TITLE: 'INVALID_FIELDS',
			MESSAGE: 'Invalid ID',
		})
	);
}
