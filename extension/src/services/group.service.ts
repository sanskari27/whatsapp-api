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
}
