import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { MessageSchedulerService, UserService } from '../../../database/services';
import UploadService from '../../../database/services/uploads';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond, generateBatchID, validatePhoneNumber } from '../../../utils/ExpressUtils';
import VCardBuilder from '../../../utils/VCardBuilder';
import WhatsappUtils from '../../../utils/WhatsappUtils';
import { FileUtils } from '../../../utils/files';

export async function scheduleMessage(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const reqValidator = z
		.object({
			type: z.enum(['NUMBERS', 'CSV', 'GROUP_INDIVIDUAL', 'GROUP', 'LABEL']),
			numbers: z.string().array().default([]),
			csv_file: z.string().default(''),
			group_ids: z.string().array().default([]),
			label_ids: z.string().array().default([]),
			message: z.string().default(''),
			variables: z.string().array().default([]),
			shared_contact_cards: z
				.object({
					first_name: z.string().default(''),
					last_name: z.string().default(''),
					title: z.string().default(''),
					organization: z.string().default(''),
					email_personal: z.string().default(''),
					email_work: z.string().default(''),
					contact_number_phone: z.string().default(''),
					contact_number_work: z.string().default(''),
					contact_number_other: z.string().array().default([]),
					links: z.string().array().default([]),
					street: z.string().default(''),
					city: z.string().default(''),
					state: z.string().default(''),
					country: z.string().default(''),
					pincode: z.string().default(''),
				})
				.array()
				.default([]),
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
			if (obj.type === 'NUMBERS' && obj.numbers.length === 0) {
				return false;
			} else if (obj.type === 'CSV' && obj.csv_file.length === 0) {
				return false;
			} else if (obj.type === 'GROUP' && obj.group_ids.length === 0) {
				return false;
			} else if (obj.type === 'GROUP_INDIVIDUAL' && obj.group_ids.length === 0) {
				return false;
			} else if (obj.type === 'LABEL' && obj.label_ids.length === 0) {
				return false;
			}
			if (
				obj.message.length === 0 &&
				obj.attachments.length === 0 &&
				obj.shared_contact_cards.length === 0
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
		group_ids,
		label_ids,
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

	let messages: string[] | null = null;
	let numbers: string[] = [];
	let _attachments: {
		[key: string]: {
			filename: string;
			caption: string;
			name: string;
		}[];
	} | null = null;

	const { isSubscribed, isNew } = new UserService(req.locals.user).isSubscribed();

	if (!isSubscribed && !isNew) {
		return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const [uploaded_attachments, media_attachments] = await new UploadService(
		req.locals.user
	).listAttachments(attachments);

	if (type === 'NUMBERS') {
		numbers = await whatsappUtils.getNumberIds(requestedNumberList as string[]);
	} else if (type === 'CSV') {
		const parsed_csv = await FileUtils.readCSV(csv_file);
		if (!parsed_csv) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.ERROR_PARSING_CSV));
		}

		numbers = [];
		messages = [];
		_attachments = {};

		const promises = parsed_csv.map(async (row) => {
			const numberWithId = await whatsappUtils.getNumberWithId(row.number);
			if (!numberWithId) {
				return; // Skips to the next iteration
			}

			numbers.push(numberWithId.numberId);
			let _message = message;

			for (const variable of variables) {
				const _variable = variable.substring(2, variable.length - 2);
				_message = _message.replace(variable, row[_variable] ?? '');
			}

			_attachments![numberWithId.numberId] = [];
			for (const attachment of uploaded_attachments) {
				let _caption = attachment.caption;
				for (const variable of variables) {
					const _variable = variable.substring(2, variable.length - 2);
					_caption = _caption.replace(variable, row[_variable] ?? '');
				}
				_attachments![numberWithId.numberId].push({
					filename: attachment.filename,
					caption: _caption,
					name: attachment.name,
				});
			}

			messages?.push(_message);
		});

		await Promise.all(promises);
	} else if (type === 'GROUP_INDIVIDUAL') {
		try {
			numbers = (
				await Promise.all(
					(group_ids as string[]).map(
						async (id) => await whatsappUtils.getChatIdsByGroup(id as string)
					)
				)
			).flat();
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID));
		}
	} else if (type === 'GROUP') {
		try {
			numbers = (
				await Promise.all(
					group_ids.map(async (id) => {
						const chat = await whatsappUtils.getChat(id as string);
						if (!chat) return null;
						return chat.id._serialized;
					})
				)
			)
				.filter((chat) => chat !== null)
				.flat() as string[];
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID));
		}
	} else if (type === 'LABEL') {
		try {
			numbers = (
				await Promise.all(
					(label_ids as string[]).map(
						async (id) => await whatsappUtils.getChatIdsByLabel(id as string)
					)
				)
			).flat();
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED));
		}
	}

	const contact_cards_promise = shared_contact_cards.map(async (detail) => {
		const vcard = new VCardBuilder(detail)
			.setFirstName(detail.first_name)
			.setLastName(detail.last_name)
			.setTitle(detail.title)
			.setOrganization(detail.organization)
			.setEmail(detail.email_personal)
			.setWorkEmail(detail.email_work)
			.setStreet(detail.street)
			.setCity(detail.city)
			.setState(detail.state)
			.setPincode(detail.pincode)
			.setCountry(detail.country);

		if (detail.contact_number_phone) {
			const number = detail.contact_number_phone.startsWith('+')
				? detail.contact_number_phone.substring(1)
				: detail.contact_number_phone;
			if (!validatePhoneNumber(number)) {
				vcard.setContactWork(`+${number}`);
			} else {
				const numberId = await whatsapp.getClient().getNumberId(number);
				if (numberId) {
					vcard.setContactWork(`+${numberId.user}`, numberId.user);
				} else {
					vcard.setContactWork(`+${number}`);
				}
			}
		}

		if (detail.contact_number_work) {
			const number = detail.contact_number_work.startsWith('+')
				? detail.contact_number_work.substring(1)
				: detail.contact_number_work;
			if (!validatePhoneNumber(number)) {
				vcard.setContactPhone(`+${number}`);
			} else {
				const numberId = await whatsapp.getClient().getNumberId(number);
				if (numberId) {
					vcard.setContactPhone(`+${numberId.user}`, numberId.user);
				} else {
					vcard.setContactPhone(`+${number}`);
				}
			}
		}

		for (const number of detail.contact_number_other) {
			const formattedNumber = number.startsWith('+') ? number.substring(1) : number;
			if (!validatePhoneNumber(formattedNumber)) {
				vcard.addContactOther(`+${formattedNumber}`);
			} else {
				const numberId = await whatsapp.getClient().getNumberId(formattedNumber);
				if (numberId) {
					vcard.addContactOther(`+${numberId.user}`, numberId.user);
				} else {
					vcard.addContactOther(`+${formattedNumber}`);
				}
			}
		}

		return vcard.build();
	});

	const contact_cards = await Promise.all(contact_cards_promise);

	const sendMessageList = numbers.map(async (number, index) => {
		const _message = messages !== null ? messages[index] : message ?? '';
		const attachments =
			type === 'CSV'
				? _attachments![number]
				: media_attachments.map((attachment) => ({
						name: attachment.name,
						filename: attachment.filename,
						caption: attachment.caption,
				  }));
		return {
			number,
			message: _message,
			attachments: attachments,
			shared_contact_cards: contact_cards ?? [],
		};
	});

	try {
		const messageSchedulerService = new MessageSchedulerService(req.locals.user);
		const campaign_exists = await messageSchedulerService.alreadyExists(campaign_name);
		if (campaign_exists) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.ALREADY_EXISTS);
		}
		const campaign_id = generateBatchID();
		const scheduled_messages = await Promise.all(sendMessageList);
		console.log(scheduled_messages);
		messageSchedulerService.scheduleBatch(scheduled_messages, {
			campaign_id,
			campaign_name,
			min_delay,
			max_delay,
			batch_size,
			batch_delay,
			startTime: startTime,
			endTime: endTime,
			client_id: req.locals.client_id,
		});

		return Respond({
			res,
			status: 200,
			data: {
				message: `${sendMessageList.length} messages scheduled.`,
				campaign_id: campaign_id,
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.ALREADY_EXISTS)) {
				return next(new APIError(API_ERRORS.COMMON_ERRORS.ALREADY_EXISTS));
			}
		}
		next(new APIError(API_ERRORS.WHATSAPP_ERROR.MESSAGE_SENDING_FAILED, err));
	}
}

const MessageController = {
	scheduleMessage,
};

export default MessageController;
