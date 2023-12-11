import axios from 'axios';
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
			if (axios.isAxiosError(err) && err.response?.data?.title === 'BUSINESS_ACCOUNT_REQUIRED') {
				throw 'BUSINESS_ACCOUNT_REQUIRED';
			}
			return [];
		}
	}
	static async fetchLabel(ids: string[]) {
		try {
			const { data } = await APIInstance.get(`/whatsapp/labels/export?label_ids=${ids.join(',')}`);
			return data.entries as {
				name: string;
				number: string;
				country: string;
				isBusiness: string;
				public_name: string;
				label: string;
				group_name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
}
