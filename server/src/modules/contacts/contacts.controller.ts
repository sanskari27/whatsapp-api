import csv from 'csvtojson/v2';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { getOrCache } from '../../config/cache';
import {
	CACHE_TOKEN_GENERATOR,
	COUNTRIES,
	CSV_PATH,
	SOCKET_RESPONSES,
	TASK_PATH,
	TASK_RESULT_TYPE,
	TASK_TYPE,
} from '../../config/const';
import {
	APIError,
	COMMON_ERRORS,
	PAYMENT_ERRORS,
	USER_ERRORS,
	WHATSAPP_ERRORS,
} from '../../errors';
import SocketServerProvider from '../../provider/socket';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import TaskService from '../../services/task';
import { TBusinessContact, TContact } from '../../types/whatsapp';
import CSVParser from '../../utils/CSVParser';
import { Respond, RespondCSV } from '../../utils/ExpressUtils';
import VCFParser from '../../utils/VCFParser';
import WhatsappUtils from '../../utils/WhatsappUtils';
import { FileUtils } from '../../utils/files';
import { ValidateNumbersValidationResult } from './contacts.validator';

async function contacts(req: Request, res: Response, next: NextFunction) {
	const { account, client_id, device } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	const taskService = new TaskService(req.locals.account);
	const options = {
		chat_contacts: req.body.chat_contacts ?? false,
		saved: req.body.saved ?? true,
		unsaved: req.body.unsaved ?? true,
		business_contacts_only: req.body.business_contacts_only ?? false,
		vcf: req.body.vcf ?? false,
	};

	let task_id: string | null = null;
	if (options.chat_contacts) {
		task_id = await taskService.createTask(
			TASK_TYPE.EXPORT_CHAT_CONTACTS,
			options.vcf ? TASK_RESULT_TYPE.VCF : TASK_RESULT_TYPE.CSV,
			{
				description: `Export chat contacts to ${
					options.vcf ? TASK_RESULT_TYPE.VCF : TASK_RESULT_TYPE.CSV
				}`,
			}
		);
	} else {
		task_id = await taskService.createTask(
			TASK_TYPE.EXPORT_ALL_CONTACTS,
			options.vcf ? TASK_RESULT_TYPE.VCF : TASK_RESULT_TYPE.CSV,
			{
				description: `Export phone-book contacts to ${
					options.vcf ? TASK_RESULT_TYPE.VCF : TASK_RESULT_TYPE.CSV
				}`,
			}
		);
	}
	SocketServerProvider.attachedSockets
		.get(account.username)
		?.emit(SOCKET_RESPONSES.TASK_CREATED, task_id.toString());

	Respond({
		res,
		status: 201,
	});
	try {
		const {
			saved,
			non_saved,
			chat_contacts: saved_chat,
		} = await getOrCache(CACHE_TOKEN_GENERATOR.CONTACTS(device._id), () =>
			whatsappUtils.getContacts()
		);

		let listed_contacts = [
			...(options.saved ? saved : []),
			...(options.unsaved ? non_saved : []),
			...(options.chat_contacts ? saved_chat : []),
		];

		listed_contacts = listed_contacts.filter(
			(c) =>
				((options.saved && c.isMyContact) || (options.unsaved && !c.isMyContact)) &&
				(!options.business_contacts_only || (options.business_contacts_only && c.isBusiness))
		);

		const contacts = await whatsappUtils.contactsWithCountry(listed_contacts);

		const data = options.vcf
			? options.business_contacts_only
				? VCFParser.exportBusinessContacts(contacts as TBusinessContact[])
				: VCFParser.exportContacts(contacts as TContact[])
			: options.business_contacts_only
			? CSVParser.exportBusinessContacts(contacts as TBusinessContact[])
			: CSVParser.exportContacts(contacts as TContact[]);

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
			.get(account.user_type)
			?.emit(SOCKET_RESPONSES.TASK_FAILED, task_id.toString());
	}
}

async function countContacts(req: Request, res: Response, next: NextFunction) {
	const { account, client_id, device } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	try {
		const { saved, non_saved,chat_contacts, groups } = await getOrCache(
			CACHE_TOKEN_GENERATOR.CONTACTS(device._id),
			async () => whatsappUtils.getContacts()
		);

		return Respond({
			res,
			status: 200,
			data: {
				phonebook_contacts: saved.length,
				non_saved_contacts: non_saved.length,
				chat_contacts: chat_contacts.length,
				groups: groups.length,
			},
		});
	} catch (err) {
		return next(new APIError(USER_ERRORS.SESSION_INVALIDATED));
	}
}

export async function validate(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}
	const {
		type,
		csv_file,
		numbers: requestedNumberList,
	} = req.locals.data as ValidateNumbersValidationResult;

	const { isSubscribed } = await account.isSubscribed();

	if (!isSubscribed) {
		return next(new APIError(PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}

	let numbers_to_be_checked: string[] = [];

	if (type === 'CSV') {
		const csvFilePath = __basedir + CSV_PATH + csv_file;
		if (!fs.existsSync(csvFilePath)) {
			return next(new APIError(COMMON_ERRORS.NOT_FOUND));
		}
		const parsed_csv = await csv().fromFile(csvFilePath);

		if (!parsed_csv) {
			return next(new APIError(COMMON_ERRORS.ERROR_PARSING_CSV));
		}

		numbers_to_be_checked = parsed_csv.map((item) => item.number);
	} else if (type === 'NUMBERS') {
		numbers_to_be_checked = requestedNumberList as string[];
	}

	const chat_ids = await whatsappUtils.getNumberIds(numbers_to_be_checked);

	const valid_contacts_promises = chat_ids.map(async (chat_id) => {
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
		const valid_contacts = await Promise.all(valid_contacts_promises);
		return RespondCSV({
			res,
			filename: 'Validated Contacts',
			data: CSVParser.exportContacts(valid_contacts as TContact[]),
		});
	} catch (e) {
		next(new APIError(WHATSAPP_ERRORS.MESSAGE_SENDING_FAILED, e));
	}
}

const ContactsController = {
	getContacts: contacts,
	countContacts,
	validate,
};

export default ContactsController;
