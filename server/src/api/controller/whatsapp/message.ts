import { NextFunction, Request, Response } from 'express';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import WAWebJS, { MessageMedia } from 'whatsapp-web.js';
import fs from 'fs';
import { ATTACHMENTS_PATH, CSV_PATH, PROMOTIONAL_MESSAGE } from '../../../config/const';
import csv from 'csvtojson/v2';
import { Respond } from '../../../utils/ExpressUtils';
import {
	getChatIdsByLabel,
	getChatIdsByGroup,
	getChatIdsByNumbers,
	getChatIdsWithNumberByNumbers,
} from '../../../utils/WhatsappUtils';
import { MessageSchedulerService, PaymentService } from '../../../database/services';
import { Message } from '../../../database/services/scheduled-message';
import { z } from 'zod';

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const reqValidator = z
		.object({
			type: z.enum(['NUMBERS', 'CSV', 'GROUP', 'LABEL']),
			numbers: z.string().array().optional(),
			csv_file: z.string().optional(),
			group_id: z.string().optional(),
			label_id: z.string().optional(),
			message: z.string().optional(),
			variables: z.string().array().optional(),
			shared_contact_cards: z.string().array().optional(),
			attachments: z
				.object({
					filename: z.string(),
					caption: z.string().optional(),
				})
				.array()
				.optional(),
		})
		.refine((obj) => {
			if (obj.type === 'NUMBERS' && obj.numbers === undefined) {
				return false;
			} else if (obj.type === 'CSV' && obj.csv_file === undefined) {
				return false;
			} else if (obj.type === 'GROUP' && obj.group_id === undefined) {
				return false;
			} else if (obj.type === 'LABEL' && obj.label_id === undefined) {
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
		group_id,
		label_id,
		csv_file,
		variables,
		shared_contact_cards,
		message,
		attachments,
		numbers: requestedNumberList,
	} = reqValidatorResult.data;

	let messages: {
		[key: string]: string;
	} | null = null;
	let numbers: string[] = [];
	const { isSubscribed, isNew } = await new PaymentService(req.locals.user).canSendMessage();

	if (!isSubscribed && !isNew) {
		return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}

	if (type === 'NUMBERS') {
		numbers = await getChatIdsByNumbers(whatsapp, requestedNumberList as string[]);
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

		const numbersWithId = await getChatIdsWithNumberByNumbers(
			whatsapp,
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
			numbers = await getChatIdsByGroup(whatsapp, group_id as string);
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID));
		}
	} else if (type === 'LABEL') {
		try {
			numbers = await getChatIdsByLabel(whatsapp, label_id as string);
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED));
		}
	}

	const mediaObjects = (attachments ?? [])
		.map((item) => {
			const path = __basedir + ATTACHMENTS_PATH + item.filename;
			if (!fs.existsSync(path)) {
				return null;
			}
			const media = MessageMedia.fromFilePath(path);
			return {
				media,
				caption: item.caption,
			};
		})
		.filter((item) => item !== null) as {
		media: WAWebJS.MessageMedia;
		caption: string;
	}[];

	const sendMessagePromises: Promise<WAWebJS.Message>[] = [];

	const contact_cards_promise = (shared_contact_cards ?? []).map(async (number) => {
		const id = await whatsapp.getClient().getNumberId(number);
		if (!id) {
			return null;
		}
		return await whatsapp.getClient().getContactById(id._serialized);
	});
	const contact_cards = (await Promise.all(contact_cards_promise)).filter(
		(card) => card !== null
	) as WAWebJS.Contact[];

	numbers.forEach((number) => {
		const _message = messages !== null ? messages[number] : message ?? '';
		if (_message.length > 0) {
			let formatted_message = _message;
			if (!isSubscribed && isNew) {
				formatted_message += PROMOTIONAL_MESSAGE;
			}
			sendMessagePromises.push(whatsapp.getClient().sendMessage(number, formatted_message));
		}
		for (const mediaObject of mediaObjects) {
			sendMessagePromises.push(
				whatsapp.getClient().sendMessage(number, mediaObject.media, {
					caption: mediaObject.caption,
				})
			);
		}

		if (contact_cards.length > 0) {
			sendMessagePromises.push(whatsapp.getClient().sendMessage(number, contact_cards));
		}
	});

	try {
		await Promise.all(sendMessagePromises);

		return Respond({
			res,
			status: 200,
			data: {
				message: `${sendMessagePromises.length} messages delivered successfully.`,
			},
		});
	} catch (e) {
		next(new APIError(API_ERRORS.WHATSAPP_ERROR.MESSAGE_SENDING_FAILED, e));
	}
}

export async function scheduleMessage(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const reqValidator = z
		.object({
			type: z.enum(['NUMBERS', 'CSV', 'GROUP', 'LABEL']),
			numbers: z.string().array().optional(),
			csv_file: z.string().optional(),
			group_id: z.string().optional(),
			label_id: z.string().optional(),
			message: z.string().optional(),
			variables: z.string().array().optional(),
			shared_contact_cards: z.string().array().optional(),
			attachments: z
				.object({
					filename: z.string(),
					caption: z.string().optional(),
				})
				.array()
				.optional(),
			delay: z.number().positive(),
			startTime: z.string().optional(),
			endTime: z.string().optional(),
			isBatched: z.boolean(),
			batch_size: z.number().optional(),
		})
		.refine((obj) => {
			if (obj.type === 'NUMBERS' && obj.numbers === undefined) {
				return false;
			} else if (obj.type === 'CSV' && obj.csv_file === undefined) {
				return false;
			} else if (obj.type === 'GROUP' && obj.group_id === undefined) {
				return false;
			} else if (obj.type === 'LABEL' && obj.label_id === undefined) {
				return false;
			}
			if (
				obj.message === undefined &&
				obj.attachments === undefined &&
				obj.shared_contact_cards === undefined
			) {
				return false;
			}
			if (obj.isBatched && obj.batch_size === undefined) {
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
		group_id,
		label_id,
		csv_file,
		variables,
		message,
		attachments,
		shared_contact_cards,
		delay,
		startTime,
		endTime,
		batch_size,
		isBatched,
		numbers: requestedNumberList,
	} = reqValidatorResult.data;

	let messages: {
		[key: string]: string;
	} | null = null;
	let numbers: string[] = [];

	const { isSubscribed, isNew } = await new PaymentService(req.locals.user).canSendMessage();

	if (!isSubscribed && !isNew) {
		return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}

	if (type === 'NUMBERS') {
		numbers = await getChatIdsByNumbers(whatsapp, requestedNumberList as string[]);
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

		const numbersWithId = await getChatIdsWithNumberByNumbers(
			whatsapp,
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
			numbers = await getChatIdsByGroup(whatsapp, group_id as string);
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID));
		}
	} else if (type === 'LABEL') {
		try {
			numbers = await getChatIdsByLabel(whatsapp, label_id as string);
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED));
		}
	}

	const mediaObjects = (attachments ?? [])
		.map((item) => {
			const path = __basedir + ATTACHMENTS_PATH + item.filename;
			if (!fs.existsSync(path)) {
				return null;
			}
			return {
				media: item.filename,
				caption: item.caption,
			};
		})
		.filter((item) => item !== null) as {
		media: string;
		caption: string;
	}[];

	const sendMessageList: Message[] = [];

	numbers.forEach((number) => {
		const arr: WAWebJS.Message[] = [];
		const _message = messages !== null ? messages[number] : message ?? '';
		if (_message.length > 0) {
			let formatted_message = _message;
			if (!isSubscribed && isNew) {
				formatted_message += PROMOTIONAL_MESSAGE;
			}
			sendMessageList.push({
				number,
				message: formatted_message,
				type: 'TEXT',
			});
		}
		for (const mediaObject of mediaObjects) {
			sendMessageList.push({
				number,
				attachment: mediaObject.media,
				caption: mediaObject.caption,
				type: 'ATTACHMENT',
			});
		}

		if (shared_contact_cards && shared_contact_cards.length > 0) {
			sendMessageList.push({
				number,
				shared_contact_cards,
				type: 'CONTACT_CARDS',
			});
		}
		return arr;
	});

	try {
		const messageSchedulerService = new MessageSchedulerService(
			req.locals.user,
			req.locals.client_id
		);
		if (isBatched) {
			messageSchedulerService.scheduleBatch(sendMessageList, {
				delay,
				batch_size: batch_size ?? 10,
				startTime: startTime,
				endTime: endTime,
			});
		} else {
			messageSchedulerService.scheduleDelay(sendMessageList, delay);
		}

		return Respond({
			res,
			status: 200,
			data: {
				message: `${sendMessageList.length} messages scheduled.`,
			},
		});
	} catch (e) {
		next(new APIError(API_ERRORS.WHATSAPP_ERROR.MESSAGE_SENDING_FAILED, e));
	}
}

const MessageController = {
	sendMessage,
	scheduleMessage,
};

export default MessageController;
