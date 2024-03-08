import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { APIError } from '../../errors';

export type CreateContactValidationResult = {
	first_name: string;
	middle_name: string;
	last_name: string;
	title: string;
	organization: string;
	email_personal: string;
	email_work: string;
	links: string[];
	street: string;
	city: string;
	state: string;
	country: string;
	pincode: string;
	contact_details_phone: string;
	contact_details_work: string;
	contact_details_other: string[];
};

export async function CreateContactValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		first_name: z.string().default(''),
		middle_name: z.string().default(''),
		last_name: z.string().default(''),
		title: z.string().default(''),
		organization: z.string().default(''),
		email_personal: z.string().default(''),
		email_work: z.string().default(''),
		contact_details_phone: z.string().default(''),
		contact_details_work: z.string().default(''),
		contact_details_other: z.string().array().default([]),
		links: z.string().array().default([]),
		street: z.string().default(''),
		city: z.string().default(''),
		state: z.string().default(''),
		country: z.string().default(''),
		pincode: z.string().default(''),
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
