import { Types } from 'mongoose';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { IUser } from '../../../types/user';
import ContactCardDB from '../../repository/contact-cards';

type ContactCardType = {
	first_name?: string;
	middle_name?: string;
	last_name?: string;
	title?: string;
	organization?: string;
	email_work?: string;
	links?: string[];
	street?: string;
	city?: string;
	state?: string;
	country?: string;
	pincode?: string;
	contact_details_phone?: {
		whatsapp_id?: string;
		contact_number: string;
	};
	contact_details_work?: {
		whatsapp_id?: string;
		contact_number: string;
	};
	contact_details_other?: {
		whatsapp_id?: string;
		contact_number: string;
	}[];
};

export default class ContactCardService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	async createContactCard(details: ContactCardType) {
		console.log(details);

		const contact_card = await ContactCardDB.create({
			user: this.user.id,
			...details,
		});
		return {
			id: contact_card._id as string,
			...details,
		};
	}

	async updateContactCard(id: Types.ObjectId, details: Partial<ContactCardType>) {
		const contact_card = await ContactCardDB.findById(id);
		if (!contact_card) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		Object.keys(details).forEach((key) => {
			if (key in contact_card) {
				// @ts-ignore
				contact_card[key] = details[key];
			}
		});

		const updatedContactCard = await contact_card.save();
		return {
			id: updatedContactCard._id as string,
			first_name: updatedContactCard.first_name,
			middle_name: updatedContactCard.middle_name,
			last_name: updatedContactCard.last_name,
			title: updatedContactCard.title,
			organization: updatedContactCard.organization,
			email_work: updatedContactCard.email_work,
			links: updatedContactCard.links,
			street: updatedContactCard.street,
			city: updatedContactCard.city,
			state: updatedContactCard.state,
			country: updatedContactCard.country,
			pincode: updatedContactCard.pincode,
			contact_details_phone: updatedContactCard.contact_details_phone,
			contact_details_work: updatedContactCard.contact_details_work,
			contact_details_other: updatedContactCard.contact_details_other,
		};
	}

	async deleteContactCard(id: Types.ObjectId) {
		await ContactCardDB.deleteOne({
			user: this.user.id,
			_id: id,
		});
	}

	async listContacts() {
		const contact_cards = await ContactCardDB.find({ user: this.user.id });
		return contact_cards.map((contact_card) => ({
			id: contact_card._id as string,
			first_name: contact_card.first_name,
			middle_name: contact_card.middle_name,
			last_name: contact_card.last_name,
			title: contact_card.title,
			organization: contact_card.organization,
			email_work: contact_card.email_work,
			links: contact_card.links,
			street: contact_card.street,
			city: contact_card.city,
			state: contact_card.state,
			country: contact_card.country,
			pincode: contact_card.pincode,
			contact_details_phone: contact_card.contact_details_phone,
			contact_details_work: contact_card.contact_details_work,
			contact_details_other: contact_card.contact_details_other,
		}));
	}
}
