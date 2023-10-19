import { Request, Response } from 'express';
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
export function generateBatchID() {
	return crypto.randomBytes(6).toString('hex');
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

export function getRandomNumber(min: number, max: number) {
	const randomDecimal = Math.random();

	const randomInRange = min + randomDecimal * (max - min);

	return randomInRange;
}
