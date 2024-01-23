import { NextFunction, Request, Response } from 'express';
import APIError from '../errors/api-errors';
import { idValidator } from '../utils/ExpressUtils';

export async function IDValidator(req: Request, res: Response, next: NextFunction) {
	const [isValid, id] = idValidator(req.params.id);

	if (isValid) {
		req.locals.id = id;
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
