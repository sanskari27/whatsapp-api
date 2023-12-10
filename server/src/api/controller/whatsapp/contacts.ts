import { NextFunction, Request, Response } from 'express';
import { getOrCache } from '../../../config/cache';
import { CACHE_TOKEN_GENERATOR } from '../../../config/const';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { TBusinessContact, TContact } from '../../../types/whatsapp/contact';
import CSVParser from '../../../utils/CSVParser';
import { Respond, RespondCSV, RespondVCF } from '../../../utils/ExpressUtils';
import VCFParser from '../../../utils/VCFParser';
import WhatsappUtils from '../../../utils/WhatsappUtils';

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
		business_contacts_only: false,
		vcf: false,
	};
	if (req.query.saved_contacts && req.query.saved_contacts === 'true') {
		options.saved_contacts = true;
		options.non_saved_contacts = false;
	} else if (req.query.non_saved_contacts && req.query.non_saved_contacts === 'true') {
		options.non_saved_contacts = true;
		options.saved_contacts = false;
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
			CACHE_TOKEN_GENERATOR.SAVED_CONTACTS(client_id, options.business_contacts_only),
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
			CACHE_TOKEN_GENERATOR.NON_SAVED_CONTACTS(client_id, options.business_contacts_only),
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

		if (options.saved_contacts) {
			contacts.push(...saved);
		}
		if (options.non_saved_contacts) {
			contacts.push(...non_saved);
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
		const saved = await getOrCache(CACHE_TOKEN_GENERATOR.SAVED_CONTACTS(client_id), async () => {
			const saved = await whatsappUtils.getSavedContacts();
			const contact_with_country_code = await whatsappUtils.contactsWithCountry(saved);
			return await Promise.all(contact_with_country_code);
		});

		const non_saved = await getOrCache(
			CACHE_TOKEN_GENERATOR.NON_SAVED_CONTACTS(client_id),
			async () => {
				const non_saved = await whatsappUtils.getNonSavedContacts();
				const contact_with_country_code = await whatsappUtils.contactsWithCountry(non_saved);
				return await Promise.all(contact_with_country_code);
			}
		);

		return Respond({
			res,
			status: 200,
			data: {
				saved_contacts: saved.length,
				non_saved_contacts: non_saved.length,
				total_contacts: saved.length + non_saved.length,
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

const ContactsController = {
	getContacts: contacts,
	countContacts,
};

export default ContactsController;
