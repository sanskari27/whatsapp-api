import APIInstance from '../config/APIInstance';

export default class LabelService {
	static async listLabels() {
		try {
			const { data } = await APIInstance.get(`/labels`);
			return data.groups as {
				id: string;
				name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
	static async fetchLabel(id: string) {
		try {
			const { data } = await APIInstance.get(`/labels/${id}`);
			return {
				name: data.name as string,
				entries: data.entries as {
					name: string;
					number: string;
					country: string;
					isBusiness: string;
					label: string;
					group_name: string;
				}[],
			};
		} catch (err) {
			return null;
		}
	}
}
