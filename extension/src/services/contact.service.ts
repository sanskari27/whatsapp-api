import APIInstance from '../config/APIInstance';

export default class ContactService {
	static async contactCount() {
		try {
			const { data } = await APIInstance.get(`/contacts/count`);
			return {
				saved: data.saved_contacts as number,
				unsaved: data.non_saved_contacts as number,
				total: data.total_contacts as number,
			};
		} catch (err) {
			return {
				saved: 0,
				unsaved: 0,
				total: 0,
			};
		}
	}
}
