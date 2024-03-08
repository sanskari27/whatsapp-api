import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { APIError } from '../../errors';

export type CreateSchedulerValidationResult = {
	csv: Types.ObjectId;
	message: string;
	shared_contact_cards: Types.ObjectId[];
	attachments: Types.ObjectId[];
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];
	title: string;
	description: string;
	start_from: string;
	end_at: string;
};

export async function CreateSchedulerValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		csv: z
			.string()
			.refine((value) => Types.ObjectId.isValid(value))
			.transform((value) => new Types.ObjectId(value)),
		message: z.string().trim().default(''),
		title: z.string().trim().default(''),
		description: z.string().trim().default(''),
		start_from: z.string().trim().default(''),
		end_at: z.string().trim().default(''),
		shared_contact_cards: z
			.string()
			.array()
			.default([])
			.refine((attachments) => !attachments.some((value) => !Types.ObjectId.isValid(value)))
			.transform((attachments) => attachments.map((value) => new Types.ObjectId(value))),
		attachments: z
			.string()
			.array()
			.default([])
			.refine((attachments) => !attachments.some((value) => !Types.ObjectId.isValid(value)))
			.transform((attachments) => attachments.map((value) => new Types.ObjectId(value))),
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
