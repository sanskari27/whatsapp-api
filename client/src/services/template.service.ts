import APIInstance from '../config/APIInstance';

type PollItem = {
	title: string;
	options: string[];
	isMultiSelect: boolean;
};

export default class TemplateService {
	static async createMessageTemplate(data: { message: string; name: string }) {
		try {
			const { data: response } = await APIInstance.post(`/template/message`, data);
			return response.template as { id: string; name: string; message: string };
		} catch (err) {
			return null;
		}
	}

	static async updateMessageTemplate(id: string, data: { message: string; name: string }) {
		try {
			const { data: response } = await APIInstance.put(`/template/message/${id}`, {
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
			const { data: response } = await APIInstance.get(`/template/message`);
			return response.templates as { id: string; name: string; message: string }[];
		} catch (err) {
			return [];
		}
	}
	static async createPollTemplate(data: { poll: PollItem; name: string }) {
		try {
			const { data: response } = await APIInstance.post(`/template/poll`, data);
			return response.template as { id: string; name: string; poll: PollItem };
		} catch (err) {
			return null;
		}
	}

	static async updatePollTemplate(id: string, data: { poll: PollItem; name: string }) {
		try {
			const { data: response } = await APIInstance.put(`/template/poll/${id}`, {
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
			const { data: response } = await APIInstance.get(`/template/poll`);
			return response.templates as { id: string; name: string; poll: PollItem }[];
		} catch (err) {
			return [];
		}
	}
	static async deleteTemplate(id: string, type: 'message' | 'poll') {
		try {
			await APIInstance.delete(`/template/${type}/${id}`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
