import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BILLING_PLANS_DETAILS, BILLING_PLANS_TYPE } from '../../config/const';
import { APIError } from '../../errors';

export type CreateBucketValidationResult = {
	name: string;
	email: string;
	phone_number: string;
	admin_number: string;
	whatsapp_numbers: string[];
	type: 'one-time' | 'subscription';
	plan_name: BILLING_PLANS_TYPE;
	billing_address: {
		street: string;
		city: string;
		district: string;
		state: string;
		country: string;
		pincode: string;
		gstin: string;
	};
};

export async function CreateBucketValidator(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z
		.object({
			name: z.string(),
			email: z.string(),
			phone_number: z.string(),
			admin_number: z.string(),
			whatsapp_numbers: z.string().array(),
			type: z.enum(['one-time', 'subscription']),
			plan_name: z.enum([
				BILLING_PLANS_TYPE.SILVER_MONTH,
				BILLING_PLANS_TYPE.GOLD_MONTH,
				BILLING_PLANS_TYPE.PLATINUM_MONTH,
				BILLING_PLANS_TYPE.SILVER_YEAR,
				BILLING_PLANS_TYPE.GOLD_YEAR,
				BILLING_PLANS_TYPE.PLATINUM_YEAR,
			]),
			billing_address: z.object({
				street: z.string().default(''),
				city: z.string().default(''),
				district: z.string(),
				state: z.string(),
				country: z.string(),
				pincode: z.string(),
				gstin: z.string().default(''),
			}),
		})
		.refine((obj) => {
			if (obj.billing_address.gstin !== '') {
				const expr = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
				if (!expr.test(obj.billing_address.gstin)) {
					return false;
				}
			}
			const applicable_users = BILLING_PLANS_DETAILS[obj.plan_name].user_count;
			return obj.whatsapp_numbers.length <= applicable_users;
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

export async function CouponValidator(req: Request, res: Response, next: NextFunction) {
	const couponValidator = z.object({
		coupon_code: z.string(),
	});
	const validationResult = couponValidator.safeParse(req.body);
	if (validationResult.success) {
		req.locals.data = validationResult.data.coupon_code;
		return next();
	}

	return next(
		new APIError({
			STATUS: 400,
			TITLE: 'INVALID_FIELDS',
			MESSAGE: 'Invalid Bucket ID or coupon code',
		})
	);
}
