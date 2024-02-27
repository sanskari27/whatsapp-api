import APIInstance from '../config/APIInstance';

export default class ContactService {
	static async contactCount() {
		const { data } = await APIInstance.get(`/whatsapp/contacts/count`);
		return {
			saved: data.saved_contacts as number,
			unsaved: data.non_saved_contacts as number,
			total: data.total_contacts as number,
			saved_chat: data.saved_chat_contacts as number,
		};
	}
	static async contacts({
		saved_contacts = false,
		saved_chat_contacts = false,
		non_saved_contacts = false,
		vcf_only = false,
		business_contacts_only = false,
	}) {
		try {
			await APIInstance.post(`/whatsapp/contacts`, {
				saved_contacts,
				saved_chat_contacts,
				non_saved_contacts,
				business_contacts_only,
				vcf: vcf_only,
			});
			return true;
		} catch (err) {
			return false;
		}
	}
}
