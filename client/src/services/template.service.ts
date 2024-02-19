import APIInstance from '../config/APIInstance';

type PollItem = {
	title: string;
	options: string[];
	isMultiSelect: boolean;
};

export default class TemplateService {
	static async createMessageTemplate(data: { message: string; name: string }) {
		try {
			const { data: response } = await APIInstance.post(`/message/template`, data);
			return response.template as { id: string; name: string; message: string };
		} catch (err) {
			return null;
		}
	}

	static async updateMessageTemplate(id: string, data: { message: string; name: string }) {
		try {
			const { data: response } = await APIInstance.put(`/message/template/${id}`, {
				name: data.name,
				message: data.message,
			});
			return response.template as { id: string; name: string; message: string };
		} catch (err) {
			return null;
		}
	}

	static async listMessageTemplate() {
		try {
			const { data: response } = await APIInstance.get(`/message/template`);
			return response.templates as { id: string; name: string; message: string }[];
		} catch (err) {
			return [];
		}
	}
	static async createPollTemplate(data: { poll: PollItem; name: string }) {
		try {
			const { data: response } = await APIInstance.post(`/poll/template`, data);
			return response.template as { id: string; name: string; poll: PollItem };
		} catch (err) {
			return null;
		}
	}

	static async updatePollTemplate(id: string, data: { poll: PollItem; name: string }) {
		try {
			const { data: response } = await APIInstance.put(`/poll/template/${id}`, {
				name: data.name,
				poll: data.poll,
			});
			return response.template as { id: string; name: string; poll: PollItem };
		} catch (err) {
			return null;
		}
	}

	static async listPollTemplate() {
		try {
			const { data: response } = await APIInstance.get(`/poll/template`);
			return response.templates as { id: string; name: string; poll: PollItem }[];
		} catch (err) {
			return [];
		}
	}
	static async deleteTemplate(id: string, type: 'message' | 'poll') {
		try {
			await APIInstance.delete(`/${type}/template/${id}`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
