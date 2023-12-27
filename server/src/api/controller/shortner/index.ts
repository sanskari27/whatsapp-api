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
	const doc = await ShortnerDB.create({
		link,
		user: req.locals.user,
	});

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
			shorten_link: `https://open.savemyvcard.com/${doc.key}`,
			link: doc.link,
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
	const doc = await ShortnerDB.create({
		link,
		user: req.locals.user,
	});
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
			shorten_link: `https://open.savemyvcard.com/${doc.key}`,
			link: doc.link,
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
	const doc = await ShortnerDB.findOne({
		_id: id,
		user: req.locals.user,
	});

	if (!doc) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
	}
	doc.link = link;
	await doc.save();

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
			shorten_link: `https://open.savemyvcard.com/${doc.key}`,
			link: doc.link,
			base64: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
		},
	});
}

async function open(req: Request, res: Response, next: NextFunction) {
	const id = req.params.id;
	const doc = await ShortnerDB.findById(id);
	if (!doc) {
		return res.send();
	}

	return res.redirect(doc.link);
}

async function listAll(req: Request, res: Response, next: NextFunction) {
	const docs = await ShortnerDB.find({ user: req.locals.user });

	const promises = docs.map(async (doc) => {
		const qrCodeBuffer = await QRUtils.generateQR(doc.link);
		if (!qrCodeBuffer) {
			return {
				id: doc._id,
				shorten_link: `https://open.savemyvcard.com/${doc.key}`,
				link: doc.link,
			};
		}
		return {
			id: doc._id,
			shorten_link: `https://open.savemyvcard.com/${doc.key}`,
			link: doc.link,
			base64: `data:image/png;base64,${qrCodeBuffer.toString('base64')}`,
		};
	});

	return Respond({
		res,
		status: 200,
		data: {
			links: await Promise.all(promises),
		},
	});
}

const WhatsappShortner = {
	createWhatsappLink,
	createLink,
	open,
	updateLink,
	listAll,
};

export default WhatsappShortner;
