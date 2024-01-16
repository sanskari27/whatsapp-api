import { NextFunction, Request, Response } from 'express';
import WAWebJS from 'whatsapp-web.js';
import { z } from 'zod';
import { getOrCache } from '../../../config/cache';
import { CACHE_TOKEN_GENERATOR } from '../../../config/const';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import {
	TBusinessContact,
	TContact,
	TLabelBusinessContact,
	TLabelContact,
} from '../../../types/whatsapp';
import CSVParser from '../../../utils/CSVParser';
import { Respond, RespondCSV, RespondVCF } from '../../../utils/ExpressUtils';
import VCFParser from '../../../utils/VCFParser';
import WhatsappUtils from '../../../utils/WhatsappUtils';
import { FileUtils } from '../../../utils/files';

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
			CACHE_TOKEN_GENERATOR.LABELS(req.locals.user._id),
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
	const options = {
		business_contacts_only: false,
		vcf: false,
	};
	if (req.query.business_contacts_only && req.query.business_contacts_only === 'true') {
		options.business_contacts_only = true;
	}
	if (req.query.vcf && req.query.vcf === 'true') {
		options.vcf = true;
	}

	try {
		const label_ids_array = ((label_ids ?? '') as string).split(',');
		const contacts = await getOrCache(
			CACHE_TOKEN_GENERATOR.MAPPED_CONTACTS(req.locals.user._id, options.business_contacts_only),
			async () => await whatsappUtils.getMappedContacts(options.business_contacts_only)
		);

		const participants_promise = label_ids_array.map(async (label_id) => {
			const label_participants = await getOrCache(
				CACHE_TOKEN_GENERATOR.LABELS_EXPORT(
					req.locals.user._id,
					label_id,
					options.business_contacts_only
				),
				async () =>
					await whatsappUtils.getContactsByLabel(label_id, {
						business_details: options.business_contacts_only,
						mapped_contacts: contacts,
					})
			);
			return label_participants;
		});

		const participants = (await Promise.all(participants_promise)).flat();

		if (options.vcf) {
			return RespondVCF({
				res,
				filename: 'Exported Label Contacts',
				data: options.business_contacts_only
					? VCFParser.exportBusinessContacts(participants as TBusinessContact[])
					: VCFParser.exportContacts(participants as TContact[]),
			});
		} else {
			return RespondCSV({
				res,
				filename: 'Exported Label Contacts',
				data: options.business_contacts_only
					? CSVParser.exportLabelBusinessContacts(participants as TLabelBusinessContact[])
					: CSVParser.exportLabelContacts(participants as TLabelContact[]),
			});
		}
	} catch (err) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
	}
}

async function addLabel(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const reqValidator = z
		.object({
			type: z.enum(['CSV', 'GROUP']),
			csv_file: z.string().default(''),
			group_ids: z.string().array().default([]),
			label_id: z.string(),
		})
		.refine((obj) => {
			if (obj.type === 'CSV' && obj.csv_file.length === 0) {
				return false;
			} else if (obj.type === 'GROUP' && obj.group_ids.length === 0) {
				return false;
			}
			return true;
		});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	const { group_ids, csv_file, type, label_id } = reqValidatorResult.data;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const chat_ids: string[] = [];
	if (type === 'CSV') {
		const parsed_csv = await FileUtils.readCSV(csv_file);
		if (!parsed_csv) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.ERROR_PARSING_CSV));
		}

		await Promise.all(
			parsed_csv.map(async (row) => {
				const numberWithId = await whatsappUtils.getNumberWithId(row.number);
				if (!numberWithId) {
					return; // Skips to the next iteration
				}
				chat_ids.push(numberWithId.numberId);
			})
		);
	} else if (type === 'GROUP') {
		await Promise.all(
			group_ids.map(async (id) => {
				const chat = await whatsappUtils.getChat(id as string);
				if (!chat) return;
				chat_ids.push(chat.id._serialized);
			})
		);
	}

	try {
		const assigned_chats = await whatsappUtils.getChatIdsByLabel(label_id);
		const chats_to_assign = chat_ids.filter((id) => !assigned_chats.includes(id));
		await whatsapp.getClient().addOrRemoveLabels([label_id], chats_to_assign);
		return Respond({
			res,
			status: 200,
			data: {
				message: 'Label assigned successfully',
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED)) {
				return next(new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

async function removeLabel(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const reqValidator = z
		.object({
			type: z.enum(['CSV', 'GROUP']),
			csv_file: z.string().default(''),
			group_ids: z.string().array().default([]),
			label_id: z.string(),
		})
		.refine((obj) => {
			if (obj.type === 'CSV' && obj.csv_file.length === 0) {
				return false;
			} else if (obj.type === 'GROUP' && obj.group_ids.length === 0) {
				return false;
			}
			return true;
		});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	const { group_ids, csv_file, type, label_id } = reqValidatorResult.data;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const chat_ids: string[] = [];
	if (type === 'CSV') {
		const parsed_csv = await FileUtils.readCSV(csv_file);
		if (!parsed_csv) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.ERROR_PARSING_CSV));
		}

		await Promise.all(
			parsed_csv.map(async (row) => {
				const numberWithId = await whatsappUtils.getNumberWithId(row.number);
				if (!numberWithId) {
					return; // Skips to the next iteration
				}
				chat_ids.push(numberWithId.numberId);
			})
		);
	} else if (type === 'GROUP') {
		await Promise.all(
			group_ids.map(async (id) => {
				const chat = await whatsappUtils.getChat(id as string);
				if (!chat) return;
				chat_ids.push(chat.id._serialized);
			})
		);
	}

	const assigned_chats = await whatsappUtils.getChatIdsByLabel(label_id);
	const chats_to_remove = assigned_chats.filter((id) => chat_ids.includes(id));
	await whatsapp.getClient().addOrRemoveLabels([label_id], chats_to_remove);
	return Respond({
		res,
		status: 200,
		data: {
			message: 'Label removed successfully',
		},
	});
}

const LabelsController = {
	labels,
	exportLabels,
	addLabel,
	removeLabel,
};

export default LabelsController;
