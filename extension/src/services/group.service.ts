import APIInstance from '../config/APIInstance';

export default class GroupService {
	static async listGroups() {
		try {
			const { data } = await APIInstance.get(`/groups`);
			return data.groups as {
				id: string;
				name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
	static async fetchGroup(ids: string[]) {
		try {
			const { data } = await APIInstance.get(`/groups/export?group_ids=${ids.join(',')}`);
			return data.participants as {
				name: string;
				number: string;
				country: string;
				isBusiness: string;
				public_name: string;
				user_type: string;
				group_name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
}
