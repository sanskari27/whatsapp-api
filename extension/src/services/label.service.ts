import APIInstance from '../config/APIInstance';

export default class LabelService {
	static async listLabels() {
		try {
			const { data } = await APIInstance.get(`/labels`);
			return data.labels as {
				id: string;
				name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
	static async fetchLabel(ids: string[]) {
		try {
			const { data } = await APIInstance.get(`/labels/export?label_ids=${ids.join(',')}`);
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
