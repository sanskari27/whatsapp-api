import APIInstance from '../config/APIInstance';

export default class TemplateService {
	static async createTemplate(data: { message: string; name: string }) {
		try {
			const { data: response } = await APIInstance.post(`/template`, data);
			return response.template as { id: string; name: string; message: string };
		} catch (err) {
			return null;
		}
	}

	static async updateTemplate(data: { message: string; name: string; id: string }) {
		try {
			const { data: response } = await APIInstance.put(`/template/${data.id}`);
			return response.template as { id: string; name: string; message: string };
		} catch (err) {
			return null;
		}
	}

	static async listTemplate() {
		try {
			const { data: response } = await APIInstance.get(`/template`);
			return response.templates as { id: string; name: string; message: string }[];
		} catch (err) {
			return [];
		}
	}
	static async deleteTemplate(id: string) {
		try {
			await APIInstance.delete(`/template/${id}`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
