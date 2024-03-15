import { NextFunction, Request, Response } from 'express';
import { getOrCache } from '../../config/cache';
import {
	CACHE_TOKEN_GENERATOR,
	SOCKET_RESPONSES,
	TASK_PATH,
	TASK_RESULT_TYPE,
	TASK_TYPE,
} from '../../config/const';
import { APIError, COMMON_ERRORS, InternalError, USER_ERRORS, WHATSAPP_ERRORS } from '../../errors';
import SocketServerProvider from '../../provider/socket';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import TaskService from '../../services/task';
import {
	TBusinessContact,
	TContact,
	TLabelBusinessContact,
	TLabelContact,
} from '../../types/whatsapp';
import CSVParser from '../../utils/CSVParser';
import { Respond } from '../../utils/ExpressUtils';
import VCFParser from '../../utils/VCFParser';
import WhatsappUtils, { MappedContacts } from '../../utils/WhatsappUtils';
import { FileUtils } from '../../utils/files';
import { AssignLabelValidationResult } from './labels.validator';

async function labels(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	try {
		if (!whatsapp.isBusiness()) {
			return next(new APIError(WHATSAPP_ERRORS.BUSINESS_ACCOUNT_REQUIRED));
		}
		const labels = await whatsapp.getClient().getLabels();

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
		return next(new APIError(USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function exportLabels(req: Request, res: Response, next: NextFunction) {
	const { account, client_id, device } = req.locals;

	const { label_ids } = req.body as { label_ids: string[] };

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	} else if (!Array.isArray(label_ids) || label_ids.length === 0) {
		return next(new APIError(COMMON_ERRORS.INVALID_FIELDS));
	}

	const taskService = new TaskService(req.locals.account);
	const options = {
		business_contacts_only: req.body.business_contacts_only ?? false,
		vcf: req.body.vcf ?? false,
	};

	const task_id = await taskService.createTask(
		TASK_TYPE.EXPORT_LABEL_CONTACTS,
		options.vcf ? TASK_RESULT_TYPE.VCF : TASK_RESULT_TYPE.CSV,
		{
			description: `Export ${label_ids.length} labels.`,
		}
	);

	Respond({
		res,
		status: 201,
	});
	try {
		const saved_contacts = (
			await Promise.all(
				(
					await getOrCache(CACHE_TOKEN_GENERATOR.CONTACTS(device._id), async () =>
						whatsappUtils.getContacts()
					)
				).saved.map(async (contact) => ({
					...(await whatsappUtils.getContactDetails(contact)),
					...WhatsappUtils.getBusinessDetails(contact),
				}))
			)
		).reduce((acc, contact) => {
			acc[contact.number] = {
				name: contact.name ?? '',
				public_name: contact.public_name ?? '',
				number: contact.number ?? '',
				isBusiness: contact.isBusiness ?? 'Personal',
				country: contact.country ?? '',
				description: contact.description ?? '',
				email: contact.email ?? '',
				websites: contact.websites ?? [],
				latitude: contact.latitude ?? 0,
				longitude: contact.longitude ?? 0,
				address: contact.address ?? '',
			};
			return acc;
		}, {} as MappedContacts);

		const participants_promise = label_ids.map(async (label_id) => {
			const label_participants = await whatsappUtils.getContactsByLabel(label_id, {
				business_details: options.business_contacts_only,
				mapped_contacts: saved_contacts,
			});
			return label_participants;
		});

		const participants = (await Promise.all(participants_promise)).flat();

		const data = options.vcf
			? options.business_contacts_only
				? VCFParser.exportBusinessContacts(participants as TBusinessContact[])
				: VCFParser.exportContacts(participants as TContact[])
			: options.business_contacts_only
			? CSVParser.exportLabelBusinessContacts(participants as TLabelBusinessContact[])
			: CSVParser.exportLabelContacts(participants as TLabelContact[]);

		const file_name = `Exported Contacts${options.vcf ? '.vcf' : '.csv'}`;

		const file_path = __basedir + TASK_PATH + task_id.toString() + (options.vcf ? '.vcf' : '.csv');

		await FileUtils.writeFile(file_path, data);

		taskService.markCompleted(task_id, file_name);
		SocketServerProvider.attachedSockets
			.get(account.username)
			?.emit(SOCKET_RESPONSES.TASK_COMPLETED, task_id.toString());
	} catch (err) {
		taskService.markFailed(task_id);
		SocketServerProvider.attachedSockets
			.get(account.username)
			?.emit(SOCKET_RESPONSES.TASK_FAILED, task_id.toString());
	}
}

async function addLabel(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const { group_ids, csv_file, type, label_id } = req.locals.data as AssignLabelValidationResult;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	const chat_ids: string[] = [];
	if (type === 'CSV') {
		const parsed_csv = await FileUtils.readCSV(csv_file);
		if (!parsed_csv) {
			return next(new APIError(COMMON_ERRORS.ERROR_PARSING_CSV));
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
			if (err.isSameInstanceof(WHATSAPP_ERRORS.BUSINESS_ACCOUNT_REQUIRED)) {
				return next(new APIError(WHATSAPP_ERRORS.BUSINESS_ACCOUNT_REQUIRED));
			}
		}
		return next(new APIError(COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

async function removeLabel(req: Request, res: Response, next: NextFunction) {
	const { group_ids, csv_file, type, label_id } = req.locals.data as AssignLabelValidationResult;

	const { account, client_id } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	const chat_ids: string[] = [];
	if (type === 'CSV') {
		const parsed_csv = await FileUtils.readCSV(csv_file);
		if (!parsed_csv) {
			return next(new APIError(COMMON_ERRORS.ERROR_PARSING_CSV));
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
		const chats_to_assign = assigned_chats.filter((id) => !chat_ids.includes(id));
		await whatsapp.getClient().addOrRemoveLabels([label_id], chats_to_assign);
		return Respond({
			res,
			status: 200,
			data: {
				message: 'Label removed successfully',
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(WHATSAPP_ERRORS.BUSINESS_ACCOUNT_REQUIRED)) {
				return next(new APIError(WHATSAPP_ERRORS.BUSINESS_ACCOUNT_REQUIRED));
			}
		}
		return next(new APIError(COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

const LabelsController = {
	labels,
	exportLabels,
	addLabel,
	removeLabel,
};

export default LabelsController;
