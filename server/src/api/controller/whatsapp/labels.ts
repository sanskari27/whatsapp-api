import { NextFunction, Request, Response } from 'express';
import WAWebJS, { GroupChat } from 'whatsapp-web.js';
import { getOrCache } from '../../../config/cache';
import { CACHE_TOKEN_GENERATOR, COUNTRIES } from '../../../config/const';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond } from '../../../utils/ExpressUtils';
import WhatsappUtils from '../../../utils/WhatsappUtils';

type Chat = {
	name: string;
	number: string;
	country: string;
	isBusiness: string;
	public_name: string;
	group_name?: string;
	label?: string;
};

async function labels(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		if (!whatsapp.isBusiness()) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED));
		}
		const labels = await getOrCache<WAWebJS.Label[]>(
			CACHE_TOKEN_GENERATOR.LABELS(client_id),
			async () => await whatsapp.getClient().getLabels()
		);

		return Respond({
			res,
			status: 200,
			data: {
				labels: labels.map((label) => ({
					name: label.name,
					id: label.id,
				})),
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function exportLabels(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const { label_ids } = req.query;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const label_ids_array = ((label_ids ?? '') as string).split(',');

		const participants_promise = label_ids_array.map(async (label_id) => {
			const label_participants = await getOrCache(
				CACHE_TOKEN_GENERATOR.LABELS_EXPORT(client_id, label_id),
				async () => await whatsappUtils.getContactsByLabel(label_id)
			);
			return label_participants;
		});

		const participants = (await Promise.all(participants_promise)).flat();

		return Respond({
			res,
			status: 200,
			data: { entries: participants },
		});
	} catch (err) {
		console.log(err);

		return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
	}
}

const LabelsController = {
	labels,
	exportLabels,
};

export default LabelsController;
