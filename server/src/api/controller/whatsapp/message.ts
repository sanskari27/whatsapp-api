import csv from 'csvtojson/v2';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { Types } from 'mongoose';
import { z } from 'zod';
import { CSV_PATH } from '../../../config/const';
import { MessageSchedulerService, PaymentService } from '../../../database/services';
import UploadService from '../../../database/services/uploads';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond, generateBatchID } from '../../../utils/ExpressUtils';
import WhatsappUtils from '../../../utils/WhatsappUtils';

export async function scheduleMessage(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const reqValidator = z
		.object({
			type: z.enum(['NUMBERS', 'CSV', 'GROUP', 'LABEL']),
			numbers: z.string().array().optional(),
			csv_file: z.string().optional(),
			group_ids: z.string().array().optional(),
			label_ids: z.string().array().optional(),
			message: z.string().optional(),
			variables: z.string().array().optional(),
			shared_contact_cards: z.string().array().optional(),
			attachments: z
				.string()
				.array()
				.default([])
				.refine((attachments) => !attachments.some((value) => !Types.ObjectId.isValid(value)))
				.transform((attachments) => attachments.map((value) => new Types.ObjectId(value))),
			campaign_name: z.string().default(''),
			min_delay: z.number().positive(),
			max_delay: z.number().positive(),
			startTime: z.string().optional(),
			endTime: z.string().optional(),
			batch_delay: z.number().positive().default(1),
			batch_size: z.number().positive().default(1),
		})
		.refine((obj) => {
			if (obj.type === 'NUMBERS' && obj.numbers === undefined) {
				return false;
			} else if (obj.type === 'CSV' && obj.csv_file === undefined) {
				return false;
			} else if (obj.type === 'GROUP' && obj.group_ids === undefined) {
				return false;
			} else if (obj.type === 'LABEL' && obj.label_ids === undefined) {
				return false;
			}
			if (
				obj.message === undefined &&
				obj.attachments === undefined &&
				obj.shared_contact_cards === undefined
			) {
				return false;
			}
			return true;
		});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	const {
		type,
		group_ids: group_id,
		label_ids: label_id,
		csv_file,
		variables,
		message,
		attachments,
		shared_contact_cards,
		min_delay,
		max_delay,
		startTime,
		endTime,
		batch_size,
		batch_delay,
		campaign_name,
		numbers: requestedNumberList,
	} = reqValidatorResult.data;

	let messages: {
		[key: string]: string;
	} | null = null;
	let numbers: string[] = [];

	const { isSubscribed, isNew } = await new PaymentService(req.locals.user).isSubscribed();

	if (!isSubscribed && !isNew) {
		return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}

	if (type === 'NUMBERS') {
		numbers = await whatsappUtils.getChatIdsByNumbers(requestedNumberList as string[]);
	} else if (type === 'CSV') {
		const csvFilePath = __basedir + CSV_PATH + csv_file;
		if (!fs.existsSync(csvFilePath)) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
		}
		const parsed_csv = await csv().fromFile(csvFilePath);

		if (!parsed_csv) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.ERROR_PARSING_CSV));
		}
		const parsed_csv_mapped: {
			[key: string]: {
				[key: string]: string;
				number: string;
			};
		} = parsed_csv.reduce((acc, item) => {
			acc[item.number] = item;
			return acc;
		}, {});

		const numbersWithId = await whatsappUtils.getChatIdsWithNumberByNumbers(
			Object.keys(parsed_csv_mapped)
		);
		numbers = numbersWithId.map((item) => item.numberId);

		if (variables !== undefined && message !== undefined) {
			messages = numbersWithId.reduce(
				(acc, { number, numberId }) => {
					let _message = message;
					const row = parsed_csv_mapped[number];
					for (const variable of variables) {
						const _variable = variable.substring(2, variable.length - 2);
						_message = _message.replace(variable, row[_variable] ?? '');
					}
					acc[numberId] = _message;

					return acc;
				},
				{} as {
					[key: string]: string;
				}
			);
		}
	} else if (type === 'GROUP') {
		try {
			numbers = (
				await Promise.all(
					(group_id as string[]).map(
						async (id) => await whatsappUtils.getChatIdsByGroup(id as string)
					)
				)
			).flat();
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID));
		}
	} else if (type === 'LABEL') {
		try {
			numbers = (
				await Promise.all(
					(label_id as string[]).map(
						async (id) => await whatsappUtils.getChatIdsByLabel(id as string)
					)
				)
			).flat();
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED));
		}
	}

	const [_, media_attachments] = await new UploadService(req.locals.user).listAttachments(
		attachments
	);

	const sendMessageList = numbers.map(async (number) => {
		const _message = messages !== null ? messages[number] : message ?? '';

		return {
			number,
			message: _message,
			attachments: media_attachments,
			shared_contact_cards: shared_contact_cards ?? [],
		};
	});

	try {
		const messageSchedulerService = new MessageSchedulerService(
			req.locals.user,
			req.locals.client_id
		);
		const campaign_id = generateBatchID();
		messageSchedulerService.scheduleBatch(await Promise.all(sendMessageList), {
			campaign_id,
			campaign_name,
			min_delay,
			max_delay,
			batch_size,
			batch_delay,
			startTime: startTime,
			endTime: endTime,
		});

		return Respond({
			res,
			status: 200,
			data: {
				message: `${sendMessageList.length} messages scheduled.`,
				campaign_id: campaign_id,
			},
		});
	} catch (e) {
		next(new APIError(API_ERRORS.WHATSAPP_ERROR.MESSAGE_SENDING_FAILED, e));
	}
}

const MessageController = {
	scheduleMessage,
};

export default MessageController;
