import APIInstance from '../config/APIInstance';

export default class ContactService {
	static async contactCount() {
		const { data } = await APIInstance.get(`/whatsapp/contacts/count`);
		return {
			saved: data.saved_contacts as number,
			unsaved: data.non_saved_contacts as number,
			total: data.total_contacts as number,
		};
	}
	static async contacts({ saved_contacts = false, non_saved_contacts = false }) {
		try {
			const { data } = await APIInstance.get(
				`/whatsapp/contacts?saved_contacts=${
					saved_contacts ? 'true' : 'false'
				}&non_saved_contacts=${non_saved_contacts ? 'true' : 'false'}`
			);
			return data.contacts as {
				name: string;
				number: string;
				isBusiness: string;
				country: string;
				public_name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
}
