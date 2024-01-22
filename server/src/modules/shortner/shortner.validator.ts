import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import APIError from '../../errors/api-errors';

export type CreateWhatsappLinkValidationResult = {
	number: string;
	title: string;
	message: string;
};

export type CreateLinkValidationResult = {
	title: string;
	link: string;
};

export type UpdateLinkValidationResult = {
	title: string;
	link: string;
	number: string;
	message: string;
};

export async function LinkValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		title: z.string().default(''),
		link: z.string(),
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

export async function UpdateLinkValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		title: z.string().default(''),
		link: z.string().default(''),
		number: z.string().default(''),
		message: z.string().default(''),
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

export async function WhatsappLinkValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		title: z.string().default(''),
		number: z.string(),
		message: z.string().default(''),
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
