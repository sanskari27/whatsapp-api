import APIInstance from '../config/APIInstance';

export default class UploadsService {
	static async uploadAttachment(data: { file: File; name: string; caption: string }) {
		const formData = new FormData();
		formData.append('file', data.file);
		formData.append('name', data.name);
		formData.append('caption', data.caption);
		try {
			const { data: response } = await APIInstance.post(`/uploads/attachment`, data);
			return response.attachment as {
				id: string;
				name: string;
				filename: string;
				caption?: string;
			};
		} catch (err) {
			return null;
		}
	}

	static async listAttachments() {
		try {
			const { data: response } = await APIInstance.get(`/uploads/attachment`);
			return response.csv_list as { id: string; caption: string; filename: string }[];
		} catch (err) {
			return [];
		}
	}

	static async uploadCSV(data: { file: File; name: string }) {
		const formData = new FormData();
		formData.append('file', data.file);
		formData.append('name', data.name);
		try {
			const { data: response } = await APIInstance.post(`/uploads/csv`, data);
			return {
				name: response.name,
				filename: response.filename,
			};
		} catch (err) {
			return null;
		}
	}

	static async listCSV() {
		try {
			const { data: response } = await APIInstance.get(`/uploads/csv`);
			return response.csv_list as { id: string; filename: string }[];
		} catch (err) {
			return [];
		}
	}
	static async deleteCSV(id: string) {
		try {
			await APIInstance.delete(`/uploads/csv/${id}`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
