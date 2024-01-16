import APIInstance from '../config/APIInstance';

export default class ContactCardService {
	static async ListContactCards() {
		try {
			const { data } = await APIInstance.get(`/contact-card`);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return data.contact_cards.map((card: any) => ({
				id: card.id as string,
				first_name: card.first_name as string,
				middle_name: card.middle_name as string,
				last_name: card.last_name as string,
				title: card.title as string,
				organization: card.organization as string,
				email_personal: card.email_personal as string,
				email_work: card.email_work as string,
				links: card.links as string[],
				street: card.street as string,
				city: card.city as string,
				state: card.state as string,
				country: card.country as string,
				pincode: card.pincode as string,
				base64: card.base64 as string,
				contact_details_phone: card.contact_details_phone.contact_number && {
					country_code: card.contact_details_phone.contact_number.slice(1, -10) as string,
					number: card.contact_details_phone.contact_number.slice(-10) as string,
				},
				contact_details_work: card.contact_details_work.contact_number && {
					country_code: card.contact_details_work.contact_number.slice(1, -10) as string,
					number: card.contact_details_work.contact_number.slice(-10) as string,
				},
				contact_details_other: card.contact_details_other.map(
					(contact: { contact_number: string }) => ({
						country_code: contact.contact_number.slice(1, -10) as string,
						number: contact.contact_number.slice(-10) as string,
					})
				),
			}));
		} catch (err) {
			return [];
		}
	}

	static async CreateContactCard(data: {
		first_name: string;
		middle_name?: string;
		last_name?: string;
		title?: string;
		organization?: string;
		email_personal?: string;
		email_work?: string;
		contact_details_phone?: string | undefined;
		contact_details_work?: string | undefined;
		contact_details_other?: (string | undefined)[];
		links?: (string | undefined)[];
		street?: string;
		city?: string;
		state?: string;
		country?: string;
		pincode?: string;
	}) {
		try {
			const { data: response } = await APIInstance.post(`/contact-card`, data);
			return {
				id: response.contact_card.id as string,
				first_name: response.contact_card.first_name as string,
				middle_name: response.contact_card.middle_name as string,
				last_name: response.contact_card.last_name as string,
				title: response.contact_card.title as string,
				organization: response.contact_card.organization as string,
				email_personal: response.contact_card.email_personal as string,
				email_work: response.contact_card.email_work as string,
				links: response.contact_card.links as string[],
				street: response.contact_card.street as string,
				city: response.contact_card.city as string,
				state: response.contact_card.state as string,
				country: response.contact_card.country as string,
				pincode: response.contact_card.pincode as string,
				base64: response.contact_card.base64 as string,
				contact_details_phone: response.contact_card.contact_details_phone &&
					response.contact_card.contact_details_phone.contact_number && {
						country_code: response.contact_card.contact_details_phone.contact_number.slice(
							1,
							-10
						) as string,
						number: response.contact_card.contact_details_phone.contact_number.slice(-10) as string,
					},
				contact_details_work: response.contact_card.contact_details_work &&
					response.contact_card.contact_details_work.contact_number && {
						country_code: response.contact_card.contact_details_work.contact_number.slice(
							1,
							-10
						) as string,
						number: response.contact_card.contact_details_work.contact_number.slice(-10) as string,
					},
				contact_details_other: response.contact_card.contact_details_other.map(
					(contact: { contact_number: string }) => ({
						country_code: contact.contact_number.slice(1, -10) as string,
						number: contact.contact_number.slice(-10) as string,
					})
				),
			};
		} catch (err) {
			return null;
		}
	}

	static async DeleteContacts(id: string) {
		try {
			const { data } = await APIInstance.delete(`/contact-card/${id}`);
			return data;
		} catch (err) {
			return [];
		}
	}

	static async UpdateContactCard(data: {
		id: string;
		first_name: string;
		middle_name?: string;
		last_name?: string;
		title?: string;
		organization?: string;
		email_personal?: string;
		email_work?: string;
		contact_details_phone?: string | undefined;
		contact_details_work?: string | undefined;
		contact_details_other?: (string | undefined)[];
		links?: (string | undefined)[];
		street?: string;
		city?: string;
		state?: string;
		country?: string;
		pincode?: string;
	}) {
		try {
			const { data: response } = await APIInstance.put(`/contact-card/${data.id}`, data);
			return {
				id: response.contact_card.id as string,
				first_name: response.contact_card.first_name as string,
				middle_name: response.contact_card.middle_name as string,
				last_name: response.contact_card.last_name as string,
				title: response.contact_card.title as string,
				organization: response.contact_card.organization as string,
				email_personal: response.contact_card.email_personal as string,
				email_work: response.contact_card.email_work as string,
				links: response.contact_card.links as string[],
				street: response.contact_card.street as string,
				city: response.contact_card.city as string,
				state: response.contact_card.state as string,
				country: response.contact_card.country as string,
				pincode: response.contact_card.pincode as string,
				base64: response.contact_card.base64 as string,
				contact_details_phone: response.contact_card.contact_details_phone && {
					country_code: response.contact_card.contact_details_phone.contact_number.slice(
						1,
						-10
					) as string,
					number: response.contact_card.contact_details_phone.contact_number.slice(-10) as string,
				},
				contact_details_work: response.contact_card.contact_details_work && {
					country_code: response.contact_card.contact_details_work.contact_number.slice(
						1,
						-10
					) as string,
					number: response.contact_card.contact_details_work.contact_number.slice(-10) as string,
				},
				contact_details_other: response.contact_card.contact_details_other.map(
					(contact: { contact_number: string }) => ({
						country_code: contact.contact_number.slice(1, -10) as string,
						number: contact.contact_number.slice(-10) as string,
					})
				),
			};
		} catch (err) {
			return null;
		}
	}
}
