import { NextFunction, Request, Response } from 'express';
import ContactCardService from '../../services/contact-card';
import { Respond } from '../../utils/ExpressUtils';
import { CreateContactValidationResult } from './contact-card.validator';

async function listContactCards(req: Request, res: Response, next: NextFunction) {
	const contact_cards = await new ContactCardService(req.locals.account).listContacts();

	return Respond({
		res,
		status: 200,
		data: {
			contact_cards,
		},
	});
}

async function createContactCard(req: Request, res: Response, next: NextFunction) {
	const data = req.locals.data as CreateContactValidationResult;
	const service = new ContactCardService(req.locals.account);
	const details: {
		contact_details_phone?: {
			contact_number: string;
			whatsapp_id?: string;
		};
		contact_details_work?: {
			contact_number: string;
			whatsapp_id?: string;
		};
		contact_details_other: {
			contact_number: string;
			whatsapp_id?: string;
		}[];
	} = {
		contact_details_other: [],
	};

	if (data.contact_details_phone) {
		details.contact_details_phone = await getNumberDetails(data.contact_details_phone);
	}

	if (data.contact_details_work) {
		details.contact_details_work = await getNumberDetails(data.contact_details_work);
	}

	for (const number of data.contact_details_other) {
		const detail = await getNumberDetails(number);
		details.contact_details_other.push(detail);
	}
	const contact_card = await service.createContactCard({
		first_name: data.first_name,
		middle_name: data.middle_name,
		last_name: data.last_name,
		title: data.title,
		organization: data.organization,
		email_personal: data.email_personal,
		email_work: data.email_work,
		links: data.links,
		street: data.street,
		city: data.city,
		state: data.state,
		country: data.country,
		pincode: data.pincode,
		contact_phone: details.contact_details_phone,
		contact_work: details.contact_details_work,
		contact_other: details.contact_details_other,
	});

	return Respond({
		res,
		status: 200,
		data: {
			contact_card,
		},
	});
}

async function updateContactCard(req: Request, res: Response, next: NextFunction) {
	const data = req.locals.data as CreateContactValidationResult;
	const service = new ContactCardService(req.locals.account);
	const details: {
		contact_details_phone?: {
			contact_number: string;
			whatsapp_id?: string;
		};
		contact_details_work?: {
			contact_number: string;
			whatsapp_id?: string;
		};
		contact_details_other: {
			contact_number: string;
			whatsapp_id?: string;
		}[];
	} = {
		contact_details_other: [],
	};

	if (data.contact_details_phone) {
		details.contact_details_phone = await getNumberDetails(data.contact_details_phone);
	}

	if (data.contact_details_work) {
		details.contact_details_work = await getNumberDetails(data.contact_details_work);
	}

	for (const number of data.contact_details_other) {
		const detail = await getNumberDetails(number);
		details.contact_details_other.push(detail);
	}
	const contact_card = await service.updateContactCard(req.locals.id, {
		first_name: data.first_name,
		middle_name: data.middle_name,
		last_name: data.last_name,
		title: data.title,
		organization: data.organization,
		email_personal: data.email_personal,
		email_work: data.email_work,
		links: data.links,
		street: data.street,
		city: data.city,
		state: data.state,
		country: data.country,
		pincode: data.pincode,
		contact_phone: details.contact_details_phone,
		contact_work: details.contact_details_work,
		contact_other: details.contact_details_other,
	});

	return Respond({
		res,
		status: 200,
		data: {
			contact_card,
		},
	});
}

async function deleteContactCard(req: Request, res: Response, next: NextFunction) {
	new ContactCardService(req.locals.account).deleteContactCard(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}
const ContactCardController = {
	listContactCards,
	createContactCard,
	updateContactCard,
	deleteContactCard,
};

export default ContactCardController;

async function getNumberDetails(phone: string) {
	const number = phone.startsWith('+') ? phone.substring(1) : phone;
	return {
		contact_number: `+${number}`,
		whatsapp_id: number,
	};
}
