import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { APIError } from '../../errors';
import { TPoll } from '../../types/poll';

export type CreateSchedulerValidationResult = {
	devices: string[];
	csv: string;
	message: string;
	contacts: string[];
	attachments: string[];
	polls: TPoll[];
	name: string;
	description: string;
	startTime: string;
	endTime: string;
};

export async function CreateSchedulerValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		devices: z.string().array().default([]),
		csv: z.string(),
		message: z.string().trim().default(''),
		name: z.string().trim().default(''),
		description: z.string().trim().default(''),
		startTime: z.string().trim().default('00:01'),
		endTime: z.string().trim().default('23:59'),
		contacts: z.string().array().default([]),
		attachments: z.string().array().default([]),
		polls: z
			.object({
				title: z.string(),
				options: z.string().array().min(1),
				isMultiSelect: z.boolean().default(false),
			})
			.array()
			.default([]),
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
