import { Request, Response } from 'express';
import { IS_PRODUCTION } from '../config/const';
import { Types } from 'mongoose';
import { z } from 'zod';
import crypto from 'crypto';
type ResponseData = {
	res: Response;
	status: 200 | 201 | 400 | 401 | 403 | 404 | 500;
	data?: object;
};

export const Respond = ({ res, status, data = {} }: ResponseData) => {
	if (status === 200 || status === 201) {
		const auth_token = res.locals.auth_token;
		const refresh_token = res.locals.refresh_token;
		if (auth_token !== undefined) {
			res.cookie('auth_token', auth_token, {
				httpOnly: true,
				sameSite: IS_PRODUCTION ? 'strict' : 'none',
				secure: true,
				maxAge: 1000 * 60 * 3,
			});
		}

		if (refresh_token !== undefined) {
			res.cookie('refresh_token', refresh_token, {
				httpOnly: true,
				sameSite: IS_PRODUCTION ? 'strict' : 'none',
				secure: true,
				maxAge: 1000 * 60 * 60 * 24 * 30,
			});
		}

		return res.status(status).json({ ...data, success: true });
	}
	return res.status(status).json({ ...data, success: false });
};

export const parseAmount = (amount: number) => {
	return Number(amount.toFixed(2));
};

export const getRequestIP = (req: Request) => {
	return (req.headers['x-real-ip'] ?? req.socket.remoteAddress)?.toString();
};

export function generateClientID() {
	return crypto.randomUUID();
}

type IDValidatorResult = [true, Types.ObjectId] | [false, undefined];
export function idValidator(id: string): IDValidatorResult {
	const validator = z
		.string()
		.refine((value) => Types.ObjectId.isValid(value))
		.transform((value) => new Types.ObjectId(value));

	const result = validator.safeParse(id);
	if (result.success === false) {
		return [false, undefined];
	} else {
		return [true, result.data];
	}
}
