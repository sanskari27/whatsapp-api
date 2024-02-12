import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import APIError from '../../errors/api-errors';

export type CreateGroupValidationResult = {
	csv_file: string;
	name: string;
};

export type MergeGroupValidationResult = {
	group_name: string;
	group_ids: string[];
	group_reply?: {
		saved: string;
		unsaved: string;
	};
	private_reply?: {
		saved: string;
		unsaved: string;
	} | null;
};

export async function CreateGroupValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		csv_file: z.string().default(''),
		name: z.string(),
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

export async function MergeGroupValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z
		.object({
			group_name: z.string(),
			group_ids: z.string().array().default([]),
			group_reply: z
				.object({
					saved: z.string(),
					unsaved: z.string(),
				})
				.or(z.null())
				.optional(),
			private_reply: z
				.object({
					saved: z.string(),
					unsaved: z.string(),
				})
				.or(z.null())
				.optional(),
		})
		.refine((obj) => obj.group_ids.length !== 0);
	const validationResult = reqValidator.safeParse(req.body);
	if (validationResult.success) {
		req.locals.data = validationResult.data;
		return next();
	}
	const message = validationResult.error.issues
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
