import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import ShortnerDB from '../../../database/repository/shortner';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond, idValidator } from '../../../utils/ExpressUtils';
import QRUtils from '../../../utils/QRUtils';

async function createWhatsappLink(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		number: z.string(),
		message: z.string().default(''),
	});
	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const { number, message } = reqValidatorResult.data;
	const link = `wa.me/${number}?text=${encodeURIComponent(message)}`;
	const key = await ShortnerDB.saveLink(link);

	const qrCodeBuffer = await QRUtils.generateQR(link);

	if (!qrCodeBuffer) {
		return Respond({
			res,
			status: 500,
		});
	}

	return Respond({
		res,
		status: 200,
		data: {
			link: `https://open.whatsleads.in/${key}`,
			base64: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
		},
	});
}

async function createLink(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		link: z.string(),
	});
	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const { link } = reqValidatorResult.data;
	const key = await ShortnerDB.saveLink(link);

	const qrCodeBuffer = await QRUtils.generateQR(link);

	if (!qrCodeBuffer) {
		return Respond({
			res,
			status: 500,
		});
	}

	return Respond({
		res,
		status: 200,
		data: {
			link: `https://open.whatsleads.in/${key}`,
			base64: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
		},
	});
}

async function updateLink(req: Request, res: Response, next: NextFunction) {
	const [idValid, id] = idValidator(req.params.id);

	const reqValidator = z.object({
		link: z.string(),
	});
	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success || !idValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const { link } = reqValidatorResult.data;
	const key = await ShortnerDB.updateLink(id, link);

	const qrCodeBuffer = await QRUtils.generateQR(link);

	if (!qrCodeBuffer) {
		return Respond({
			res,
			status: 500,
		});
	}

	return Respond({
		res,
		status: 200,
		data: {
			link: `https://open.whatsleads.in/${key}`,
			base64: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
		},
	});
}

async function open(req: Request, res: Response, next: NextFunction) {
	const id = req.params.id;
	const link = await ShortnerDB.getLink(id);
	if (!link) {
		return res.send();
	}

	return res.redirect(link);
}

const WhatsappShortner = {
	createWhatsappLink,
	createLink,
	open,
	updateLink,
};

export default WhatsappShortner;
