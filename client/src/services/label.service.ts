import APIInstance from '../config/APIInstance';

export default class LabelService {
	static async listLabels() {
		try {
			const { data } = await APIInstance.get(`/whatsapp/labels`);
			return data.labels as {
				id: string;
				name: string;
			}[];
		} catch (err) {
			// if (axios.isAxiosError(err) && err.response?.data?.title === 'BUSINESS_ACCOUNT_REQUIRED') {
			// 	throw 'BUSINESS_ACCOUNT_REQUIRED';
			// }
			return [];
		}
	}
	static async fetchLabel(
		ids: string[],
		{
			vcf_only = false,
			business_contacts_only = false,
			saved_contacts = false,
			non_saved_contacts = false,
		}
	) {
		try {
			await APIInstance.post(`/whatsapp/labels/export`, {
				business_contacts_only,
				vcf: vcf_only,
				label_ids: ids,
				saved: saved_contacts,
				unsaved: non_saved_contacts,
			});
			return true;
		} catch (err) {
			return false;
		}
	}
	static async assignLabel(
		type: string,
		label_id: string,
		opts: { csv_file?: string; group_ids?: string[] }
	) {
		try {
			await APIInstance.post(`/whatsapp/labels/assign`, {
				type,
				label_id,
				...opts,
			});
			return true;
		} catch (err) {
			return false;
		}
	}
}
