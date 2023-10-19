import csv from 'csvtojson/v2';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { z } from 'zod';
import { CSV_PATH } from '../../../config/const';
import { PaymentService } from '../../../database/services';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond } from '../../../utils/ExpressUtils';

export async function validate(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		console.log('WHatsapp not ready');

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

	const { isSubscribed, isNew } = await new PaymentService(req.locals.user).canSendMessage();

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

	const numbersValidator = numbers_to_be_checked.map(async (number) => {
		const isRegisteredUser = await whatsapp.getClient().isRegisteredUser(number);
		return isRegisteredUser ? number : null;
	});

	const valid_numbers = (await Promise.all(numbersValidator)).filter(
		(number) => number !== null
	) as string[];

	const valid_numbers_set = new Set(valid_numbers);
	const invalid_numbers = numbers_to_be_checked.filter((x) => !valid_numbers_set.has(x));

	try {
		return Respond({
			res,
			status: 200,
			data: {
				valid_numbers,
				invalid_numbers,
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
