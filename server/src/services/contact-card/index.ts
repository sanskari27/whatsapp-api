import { contactsDB } from '../../config/postgres';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import QRUtils from '../../utils/QRUtils';
import VCardBuilder from '../../utils/VCardBuilder';
import { AccountService } from '../account';

type ContactCardType = {
	first_name: string;
	middle_name?: string;
	last_name?: string;
	title?: string;
	organization?: string;
	email_personal?: string;
	email_work?: string;
	links?: string[];
	street?: string;
	city?: string;
	state?: string;
	country?: string;
	pincode?: string;
	contact_phone?: {
		whatsapp_id?: string;
		contact_number: string;
	};
	contact_work?: {
		whatsapp_id?: string;
		contact_number: string;
	};
	contact_other?: {
		whatsapp_id?: string;
		contact_number: string;
	}[];
};

export default class ContactCardService {
	private _user: AccountService;

	public constructor(user: AccountService) {
		this._user = user;
	}

	async createContactCard(details: ContactCardType) {
		const vCardString = new VCardBuilder(details).build();
		const qrCodeBuffer = await QRUtils.generateQR(vCardString);

		const contactCard = await contactsDB.create({
			data: {
				...details,
				username: this._user.username,
				contact_phone: details.contact_phone,
				contact_work: details.contact_work,
				contact_other: details.contact_other,
				qrString: `data:image/png;base64,${qrCodeBuffer?.toString('base64')}`,
				vCardString,
			},
		});
		return {
			id: contactCard.id,
			first_name: contactCard.first_name,
			middle_name: contactCard.middle_name,
			last_name: contactCard.last_name,
			title: contactCard.title,
			organization: contactCard.organization,
			email_personal: contactCard.email_personal,
			email_work: contactCard.email_work,
			links: contactCard.links,
			street: contactCard.street,
			city: contactCard.city,
			state: contactCard.state,
			country: contactCard.country,
			pincode: contactCard.pincode,
			contact_phone: contactCard.contact_phone,
			contact_work: contactCard.contact_work,
			contact_other: contactCard.contact_other,
			base64: contactCard.qrString,
		};
	}

	async updateContactCard(id: string, details: Partial<ContactCardType>) {
		const contact_card = await contactsDB.findUnique({ where: { id } });
		if (!contact_card) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		const vCardString = new VCardBuilder(details).build();
		const qrCodeBuffer = await QRUtils.generateQR(vCardString);

		const updatedContactCard = await contactsDB.update({
			where: { id: contact_card.id },
			data: {
				...details,
				qrString: `data:image/png;base64,${qrCodeBuffer?.toString('base64')}`,
				vCardString,
			},
		});

		return {
			id: updatedContactCard.id,
			first_name: updatedContactCard.first_name,
			middle_name: updatedContactCard.middle_name,
			last_name: updatedContactCard.last_name,
			title: updatedContactCard.title,
			organization: updatedContactCard.organization,
			email_personal: updatedContactCard.email_personal,
			email_work: updatedContactCard.email_work,
			links: updatedContactCard.links,
			street: updatedContactCard.street,
			city: updatedContactCard.city,
			state: updatedContactCard.state,
			country: updatedContactCard.country,
			pincode: updatedContactCard.pincode,
			contact_phone: updatedContactCard.contact_phone,
			contact_work: updatedContactCard.contact_work,
			contact_other: updatedContactCard.contact_other,
			base64: updatedContactCard.qrString,
		};
	}

	async deleteContactCard(id: string) {
		await contactsDB.delete({
			where: {
				id: id,
				username: this._user.username,
			},
		});
	}

	async listContacts() {
		const contact_cards = await contactsDB.findMany({ where: { username: this._user.username } });
		return contact_cards.map((contact_card) => ({
			id: contact_card.id,
			first_name: contact_card.first_name,
			middle_name: contact_card.middle_name,
			last_name: contact_card.last_name,
			title: contact_card.title,
			organization: contact_card.organization,
			email_personal: contact_card.email_personal,
			email_work: contact_card.email_work,
			links: contact_card.links,
			street: contact_card.street,
			city: contact_card.city,
			state: contact_card.state,
			country: contact_card.country,
			pincode: contact_card.pincode,
			contact_phone: contact_card.contact_phone,
			contact_work: contact_card.contact_work,
			contact_other: contact_card.contact_other,
			base64: contact_card.qrString,
		}));
	}
}
