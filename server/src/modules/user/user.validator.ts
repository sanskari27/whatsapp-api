import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { APIError } from '../../errors';

export async function PaymentRemainderValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		message: z.string().trim(),
	});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (reqValidatorResult.success) {
		req.locals.data = reqValidatorResult.data.message;
		return next();
	}
	const message = reqValidatorResult.error.issues
		.map((err) => err.path)
		.flat()
		.filter((item, pos, arr) => arr.indexOf(item) == pos)
		.join(', ');

	return next(
		new APIError({
			STATUS: 400,
			TITLE: 'INVALID_FIELDS',
			MESSAGE: message,
		})
	);
}
