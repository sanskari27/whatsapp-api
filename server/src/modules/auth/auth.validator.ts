import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AccessLevel } from '../../config/const';
import { APIError } from '../../errors';
import { generateErrorMessage } from '../../utils/ExpressUtils';

export type UsernameValidationResult = {
	username: string;
	password: string;
	access_level: AccessLevel;
};

export type LoginValidationResult = {
	username: string;
	password: string;
	access_level: AccessLevel;
};

export type CreateAccountValidationResult = {
	name: string;
	phone: string;
	username: string;
	password: string;
};

export async function UsernameValidator(req: Request, res: Response, next: NextFunction) {
	const validator = z.object({
		username: z.string(),
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
			MESSAGE: generateErrorMessage(validationResult.error.issues),
		})
	);
}

export async function LoginValidator(req: Request, res: Response, next: NextFunction) {
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
			MESSAGE: generateErrorMessage(validationResult.error.issues),
		})
	);
}

export async function CreateAccountValidator(req: Request, res: Response, next: NextFunction) {
	const validator = z.object({
		name: z.string(),
		phone: z.string(),
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
			MESSAGE: generateErrorMessage(validationResult.error.issues),
		})
	);
}
