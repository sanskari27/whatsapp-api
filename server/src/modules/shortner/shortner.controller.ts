import { NextFunction, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { SHORTNER_REDIRECT } from '../../config/const';
import { shortnerDB } from '../../config/postgres';
import { Respond } from '../../utils/ExpressUtils';
import QRUtils from '../../utils/QRUtils';
import {
	CreateLinkValidationResult,
	CreateWhatsappLinkValidationResult,
	UpdateLinkValidationResult,
} from './shortner.validator';

async function createWhatsappLink(req: Request, res: Response, next: NextFunction) {
	const { number, message, title } = req.locals.data as CreateWhatsappLinkValidationResult;
	const link = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

	const key = nanoid(6);
	const qrCodeBuffer = await QRUtils.generateQR(link);
	const doc = await shortnerDB.create({
		data: {
			title,
			link,
			username: req.locals.account.username,
			key,
			qrString: `data:image/png;base64,${qrCodeBuffer!.toString('base64')}`,
		},
	});

	return Respond({
		res,
		status: 200,
		data: {
			shorten_link: `${SHORTNER_REDIRECT}${doc.key}`,
			link: doc.link,
			id: doc.id,
			title: doc.title,
			base64: doc.qrString,
		},
	});
}

async function createLink(req: Request, res: Response, next: NextFunction) {
	const { link, title } = req.locals.data as CreateLinkValidationResult;

	const key = nanoid(6);
	const qrCodeBuffer = await QRUtils.generateQR(`https://open.wpautomation.in/${key}`);
	const doc = await shortnerDB.create({
		data: {
			title,
			link,
			username: req.locals.account.username,
			key,
			qrString: `data:image/png;base64,${qrCodeBuffer!.toString('base64')}`,
		},
	});

	return Respond({
		res,
		status: 200,
		data: {
			id: doc.id,
			shorten_link: `${SHORTNER_REDIRECT}${doc.key}`,
			title: doc.title,
			link: doc.link,
			base64: doc.qrString,
		},
	});
}

async function updateLink(req: Request, res: Response, next: NextFunction) {
	const { link, title, number, message } = req.locals.data as UpdateLinkValidationResult;
	let doc;
	if (!link) {
		const _link = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
		const qrCodeBuffer = await QRUtils.generateQR(_link);
		doc = await shortnerDB.update({
			where: { id: req.locals.id },
			data: {
				title,
				link: _link,
				qrString: `data:image/png;base64,${qrCodeBuffer!.toString('base64')}`,
			},
		});
	} else {
		doc = await shortnerDB.update({
			where: { id: req.locals.id },
			data: {
				title,
				link: link,
			},
		});
	}

	return Respond({
		res,
		status: 200,
		data: {
			id: doc.id,
			shorten_link: `${SHORTNER_REDIRECT}${doc.key}`,
			link: doc.link,
			title: doc.title,
			base64: doc.qrString,
		},
	});
}

async function deleteLink(req: Request, res: Response, next: NextFunction) {
	await shortnerDB.delete({
		where: { id: req.locals.id },
	});

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function open(req: Request, res: Response, next: NextFunction) {
	const id = req.params.id;
	const doc = await shortnerDB.findUnique({
		where: { id },
	});
	if (!doc) {
		return res.send();
	}
	return res.redirect(doc.link);
}

async function listAll(req: Request, res: Response, next: NextFunction) {
	const docs = await shortnerDB.findMany({
		where: { username: req.locals.account.username },
	});

	const promises = docs.map((doc) => ({
		id: doc.id,
		title: doc.title,
		shorten_link: `${SHORTNER_REDIRECT}${doc.key}`,
		link: doc.link,
		base64: doc.qrString,
	}));

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
	deleteLink,
	updateLink,
	listAll,
};

export default WhatsappShortner;
