import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import ShortnerDB from '../../../database/repository/shortner';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
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
	const link = `https://api.whatsapp.com/send/?phone=${number}&text=${encodeURIComponent(message)}`;
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
	open,
};

export default WhatsappShortner;
