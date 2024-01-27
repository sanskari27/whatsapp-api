import csv from 'csvtojson/v2';
import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import { getOrCache } from '../../config/cache';
import { CACHE_TOKEN_GENERATOR, COUNTRIES, CSV_PATH } from '../../config/const';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { UserService } from '../../services';
import { TBusinessContact, TContact } from '../../types/whatsapp';
import CSVParser from '../../utils/CSVParser';
import { Respond, RespondCSV, RespondVCF } from '../../utils/ExpressUtils';
import VCFParser from '../../utils/VCFParser';
import WhatsappUtils from '../../utils/WhatsappUtils';
import { ValidateNumbersValidationResult } from './contacts.validator';

async function contacts(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const options = {
		saved_contacts: true,
		non_saved_contacts: true,
		saved_chat_contacts: true,
		business_contacts_only: false,
		vcf: false,
	};
	if (req.query.saved_contacts && req.query.saved_contacts === 'true') {
		options.saved_contacts = true;
		options.non_saved_contacts = false;
		options.saved_chat_contacts = false;
	} else if (req.query.non_saved_contacts && req.query.non_saved_contacts === 'true') {
		options.non_saved_contacts = true;
		options.saved_contacts = false;
		options.saved_chat_contacts = false;
	} else if (req.query.saved_chat_contacts && req.query.saved_chat_contacts === 'true') {
		options.saved_chat_contacts = true;
		options.saved_contacts = false;
		options.non_saved_contacts = false;
	}
	if (req.query.business_contacts_only && req.query.business_contacts_only === 'true') {
		options.business_contacts_only = true;
	}
	if (req.query.vcf && req.query.vcf === 'true') {
		options.vcf = true;
	}
	try {
		const contacts = [] as {
			name: string | undefined;
			number: string;
			isBusiness: string;
			country: string;
			public_name: string;
			description?: string;
			email?: string;
			websites?: string[];
			latitude?: number;
			longitude?: number;
			address?: string;
		}[];

		const saved = await getOrCache(
			CACHE_TOKEN_GENERATOR.SAVED_CONTACTS(req.locals.user._id, options.business_contacts_only),
			async () => {
				let saved = await whatsappUtils.getSavedContacts();
				if (options.business_contacts_only) {
					saved = saved.filter((c) => c.isBusiness);
				}
				const contact_with_country_code = await whatsappUtils.contactsWithCountry(saved, {
					business_details: options.business_contacts_only,
				});
				return await Promise.all(contact_with_country_code);
			}
		);

		const non_saved = await getOrCache(
			CACHE_TOKEN_GENERATOR.NON_SAVED_CONTACTS(req.locals.user._id, options.business_contacts_only),
			async () => {
				let non_saved = await whatsappUtils.getNonSavedContacts();
				if (options.business_contacts_only) {
					non_saved = non_saved.filter((c) => c.isBusiness);
				}
				const contact_with_country_code = await whatsappUtils.contactsWithCountry(non_saved, {
					business_details: options.business_contacts_only,
				});
				return await Promise.all(contact_with_country_code);
			}
		);

		const saved_chat_contacts = await getOrCache(
			CACHE_TOKEN_GENERATOR.SAVED_CHAT_CONTACTS(
				req.locals.user._id,
				options.business_contacts_only
			),
			async () => {
				let saved_chat = await whatsappUtils.getSavedChatContacts();
				if (options.business_contacts_only) {
					saved_chat = saved_chat.filter((c) => c.isBusiness);
				}
				const contact_with_country_code = await whatsappUtils.contactsWithCountry(saved_chat, {
					business_details: options.business_contacts_only,
				});
				return await Promise.all(contact_with_country_code);
			}
		);

		if (options.saved_contacts) {
			contacts.push(...saved);
		}
		if (options.non_saved_contacts) {
			contacts.push(...non_saved);
		}
		if (options.saved_chat_contacts) {
			contacts.push(...saved_chat_contacts);
		}
		if (options.vcf) {
			return RespondVCF({
				res,
				filename: 'Exported Contacts',
				data: options.business_contacts_only
					? VCFParser.exportBusinessContacts(contacts as TBusinessContact[])
					: VCFParser.exportContacts(contacts as TContact[]),
			});
		} else {
			return RespondCSV({
				res,
				filename: 'Exported Contacts',
				data: options.business_contacts_only
					? CSVParser.exportBusinessContacts(contacts as TBusinessContact[])
					: CSVParser.exportContacts(contacts as TContact[]),
			});
		}
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function countContacts(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const saved = await getOrCache(
			CACHE_TOKEN_GENERATOR.SAVED_CONTACTS(req.locals.user._id),
			async () => {
				const saved = await whatsappUtils.getSavedContacts();
				const contact_with_country_code = await whatsappUtils.contactsWithCountry(saved);
				return await Promise.all(contact_with_country_code);
			}
		);

		const non_saved = await getOrCache(
			CACHE_TOKEN_GENERATOR.NON_SAVED_CONTACTS(req.locals.user._id),
			async () => {
				const non_saved = await whatsappUtils.getNonSavedContacts();
				const contact_with_country_code = await whatsappUtils.contactsWithCountry(non_saved);
				return await Promise.all(contact_with_country_code);
			}
		);

		const saved_chat_contacts = await getOrCache(
			CACHE_TOKEN_GENERATOR.SAVED_CHAT_CONTACTS(req.locals.user._id),
			async () => {
				const saved_chat_contacts = await whatsappUtils.getSavedChatContacts();
				const contact_with_country_code = await whatsappUtils.contactsWithCountry(
					saved_chat_contacts
				);
				return await Promise.all(contact_with_country_code);
			}
		);

		return Respond({
			res,
			status: 200,
			data: {
				saved_contacts: saved.length,
				non_saved_contacts: non_saved.length,
				saved_chat_contacts: saved_chat_contacts.length,
				total_contacts: saved.length + non_saved.length + saved_chat_contacts.length,
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

export async function validate(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
	const {
		type,
		csv_file,
		numbers: requestedNumberList,
	} = req.locals.data as ValidateNumbersValidationResult;

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
		next(new APIError(API_ERRORS.WHATSAPP_ERROR.MESSAGE_SENDING_FAILED, e));
	}
}

const ContactsController = {
	getContacts: contacts,
	countContacts,
	validate,
};

export default ContactsController;
