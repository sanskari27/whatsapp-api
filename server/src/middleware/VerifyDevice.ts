import { NextFunction, Request, Response } from 'express';
import { APIError, USER_ERRORS } from '../errors';

export default async function VerifyDevice(req: Request, res: Response, next: NextFunction) {
	const device_id = req.headers['device-id'] as string;

	if (!device_id) {
		return next(new APIError(USER_ERRORS.DEVICE_ID_REQUIRED));
	}

	try {
		const device = await req.locals.account.isValidDevice(device_id);

		if (!device) {
			return next(new APIError(USER_ERRORS.DEVICE_ID_REQUIRED));
		}

		req.locals.device = device.device;
		req.locals.client_id = device.client_id;

		next();
	} catch (e) {
		return next(new APIError(USER_ERRORS.DEVICE_ID_REQUIRED));
	}
}
