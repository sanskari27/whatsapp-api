import { NextFunction, Request, Response } from 'express';
import WAWebJS from '../../../packages/whatsapp-web';
import WhatsappProvider from '../../providers/whatsapp';
import PendingRequestDB, { PENDING_REQUEST } from '../../repository/pending-request';
import { ResponseContact } from '../../types/responses';
import { Respond } from '../../utils/ExpressUtils';
import WhatsappUtils from '../../utils/WhatsappUtils';
import { generateID } from '../../utils/helper';

async function saved(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return res.status(400).send('NOT_READY');
	}
	const business_contacts_only = req.body.business_contacts_only ?? false;

	const request_id = generateID();

	Respond({
		res,
		status: 200,
		data: {
			request_id,
		},
	});

	const doc = await PendingRequestDB.create({
		client_id,
		key: request_id,
		type: PENDING_REQUEST.SAVED_CONTACTS,
	});

	try {
		let saved = (await whatsapp.getClient().getContacts()).filter(
			(contact) => contact.isMyContact && !contact.isMe && !contact.isGroup
		);
		console.log('GOT_SAVED');
		if (business_contacts_only) {
			saved = saved.filter((c) => c.isBusiness);
		}
		const contacts: ResponseContact[] = await whatsappUtils.contactsWithCountry(saved, {
			business_details: business_contacts_only,
		});
		console.log('SUCCESS');

		doc.status = 'SUCCESS';
		doc.data = contacts;
		doc.save();
	} catch (err: any) {
		doc.status = 'FAILED';
		doc.error = 'INTERNAL_SERVER_ERROR';
		doc.reason = err.message;
		doc.save();
	}
}

async function unsaved(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return res.status(400).send('NOT_READY');
	}

	const business_contacts_only = req.body.business_contacts_only ?? false;

	const request_id = generateID();

	Respond({
		res,
		status: 200,
		data: {
			request_id,
		},
	});

	const doc = await PendingRequestDB.create({
		key: request_id,
		type: PENDING_REQUEST.NON_SAVED_CONTACTS,
	});

	try {
		const chats = await whatsapp.getClient().getChats();

		let non_saved_contacts = (
			await Promise.all(
				chats.map(async (chat) => {
					if (chat.isGroup) return Promise.resolve(null);
					const contact = await whatsapp.getClient().getContactById(chat.id._serialized);
					if (!contact.isMyContact && !contact.isGroup && !contact.isMe) {
						return contact;
					}
					return null;
				})
			)
		).filter((contact) => contact !== null) as WAWebJS.Contact[];

		if (business_contacts_only) {
			non_saved_contacts = non_saved_contacts.filter((c) => c.isBusiness);
		}
		const contacts: ResponseContact[] = await whatsappUtils.contactsWithCountry(
			non_saved_contacts,
			{
				business_details: business_contacts_only,
			}
		);

		doc.status = 'SUCCESS';
		doc.data = contacts;
		doc.save();
	} catch (err: any) {
		doc.status = 'FAILED';
		doc.error = 'INTERNAL_SERVER_ERROR';
		doc.reason = err.message;
		doc.save();
	}
}

async function chat(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return res.status(400).send('NOT_READY');
	}

	const business_contacts_only = req.body.business_contacts_only ?? false;

	const request_id = generateID();

	Respond({
		res,
		status: 200,
		data: {
			request_id,
		},
	});

	const doc = await PendingRequestDB.create({
		key: request_id,
		type: PENDING_REQUEST.NON_SAVED_CONTACTS,
	});

	try {
		const chats = await whatsapp.getClient().getChats();

		let saved_chat_contacts = (
			await Promise.all(
				chats.map(async (chat) => {
					if (chat.isGroup) return Promise.resolve(null);
					const contact = await whatsapp.getClient().getContactById(chat.id._serialized);
					if (contact.isMyContact && !contact.isMe) {
						return contact;
					}
					return null;
				})
			)
		).filter((contact) => contact !== null) as WAWebJS.Contact[];

		if (business_contacts_only) {
			saved_chat_contacts = saved_chat_contacts.filter((c) => c.isBusiness);
		}

		const contacts: ResponseContact[] = await whatsappUtils.contactsWithCountry(
			saved_chat_contacts,
			{
				business_details: business_contacts_only,
			}
		);

		doc.status = 'SUCCESS';
		doc.data = contacts;
		doc.save();
	} catch (err: any) {
		doc.status = 'FAILED';
		doc.error = 'INTERNAL_SERVER_ERROR';
		doc.reason = err.message;
		doc.save();
	}
}

const ContactsController = {
	saved,
	unsaved,
	chat,
};

export default ContactsController;
