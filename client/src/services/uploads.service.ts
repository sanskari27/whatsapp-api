import APIInstance from '../config/APIInstance';

export default class UploadsService {
	static async uploadCSV(data: { file: File; name: string }) {
		const formData = new FormData();
		formData.append('file', data.file);
		formData.append('name', data.name);
		try {
			const { data: response } = await APIInstance.post(`/uploads/csv`, data, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});
			return {
				name: response.name,
				fileName: response.filename,
				headers: response.headers,
				id: response.id,
			};
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (err: any) {
			if (err.response.data.title === 'ALREADY_EXISTS')
				return {
					name: 'ERROR',
					fileName: 'File name already exists',
					headers: [],
					id: '',
				};
			if (err.response.data.title === 'INVALID_FIELDS')
				return {
					name: 'ERROR',
					fileName: 'Invalid Fields in CSV',
					headers: [],
					id: '',
				};

			return {
				name: 'ERROR',
				fileName: 'File not supported',
				headers: [],
				id: '',
			};
		}
	}

	static async listCSV() {
		try {
			const { data: response } = await APIInstance.get(`/uploads/csv`);
			return response.csv_list.map(
				(csv: { name: string; filename: string; headers: string[]; id: string }) => ({
					name: csv.name,
					fileName: csv.filename,
					headers: csv.headers,
					id: csv.id,
				})
			);
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

	static async downloadCSV(id: string) {
		try {
			const response = await APIInstance.get(`/uploads/csv/${id}/download`, {
				responseType: 'blob',
			});
			const blob = new Blob([response.data]);

			const contentDisposition = response.headers['content-disposition'];
			const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.*)"/);
			const filename = filenameMatch ? filenameMatch[1] : 'downloaded-file.csv';

			// Create a temporary link element
			const downloadLink = document.createElement('a');
			downloadLink.href = window.URL.createObjectURL(blob);
			downloadLink.download = filename; // Specify the filename

			// Append the link to the body and trigger the download
			document.body.appendChild(downloadLink);
			downloadLink.click();

			// Clean up - remove the link
			document.body.removeChild(downloadLink);
		} catch (err) {
			//ignore
		}
	}
}
