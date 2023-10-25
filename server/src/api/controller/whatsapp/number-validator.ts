import csv from 'csvtojson/v2';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { z } from 'zod';
import { COUNTRIES, CSV_PATH } from '../../../config/const';
import { UserService } from '../../../database/services';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond } from '../../../utils/ExpressUtils';
import WhatsappUtils from '../../../utils/WhatsappUtils';

export async function validate(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const reqValidator = z
		.object({
			type: z.enum(['NUMBERS', 'CSV']),
			numbers: z.string().array().optional(),
			csv_file: z.string().optional(),
		})
		.refine((obj) => {
			if (obj.type === 'NUMBERS' && obj.numbers === undefined) {
				return false;
			} else if (obj.type === 'CSV' && obj.csv_file === undefined) {
				return false;
			}
			return true;
		});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	const { type, csv_file, numbers: requestedNumberList } = reqValidatorResult.data;

	const { isSubscribed, isNew } = new UserService(req.locals.user).isSubscribed();

	if (!isSubscribed && !isNew) {
		return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}

	let numbers_to_be_checked: string[] = [];

	if (type === 'CSV') {
		const csvFilePath = __basedir + CSV_PATH + csv_file;
		if (!fs.existsSync(csvFilePath)) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
		}
		const parsed_csv = await csv().fromFile(csvFilePath);

		if (!parsed_csv) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.ERROR_PARSING_CSV));
		}

		numbers_to_be_checked = parsed_csv.map((item) => item.number);
	} else if (type === 'NUMBERS') {
		numbers_to_be_checked = requestedNumberList as string[];
	}

	const chat_ids = await whatsappUtils.getChatIdsByNumbers(numbers_to_be_checked);

	const valid_contacts = chat_ids.map(async (chat_id) => {
		const contact = await whatsapp.getClient().getContactById(chat_id);
		const country_code = await contact.getCountryCode();
		const country = COUNTRIES[country_code as string];
		return {
			name: contact.name ?? 'Unknown',
			number: contact.number,
			isBusiness: contact.isBusiness ? 'Business' : 'Personal',
			public_name: contact.pushname ?? '',
			country,
		};
	});

	try {
		return Respond({
			res,
			status: 200,
			data: {
				contacts: await Promise.all(valid_contacts),
			},
		});
	} catch (e) {
		next(new APIError(API_ERRORS.WHATSAPP_ERROR.MESSAGE_SENDING_FAILED, e));
	}
}

const NumberValidator = {
	validate,
};

export default NumberValidator;
