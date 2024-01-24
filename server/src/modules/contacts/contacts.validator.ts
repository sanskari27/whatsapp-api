import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import APIError from '../../errors/api-errors';

export type ValidateNumbersValidationResult = {
	type: 'NUMBERS' | 'CSV';
	numbers?: string[] | undefined;
	csv_file?: string | undefined;
};

export async function ValidateNumbersValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z
		.object({
			type: z.enum(['NUMBERS', 'CSV']),
			numbers: z.string().array().optional(),
			csv_file: z.string().optional(),
		})
		.refine((obj) => {
			if (obj.type === 'NUMBERS' && obj.numbers === undefined) {
				return false;
			} else if (obj.type === 'CSV' && obj.csv_file === undefined) {
				return false;
			}
			return true;
		});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (reqValidatorResult.success) {
		req.locals.data = reqValidatorResult.data;
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
