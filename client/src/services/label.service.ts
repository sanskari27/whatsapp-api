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
			// if (axios.isAxiosError(err) && err.response?.data?.title === 'BUSINESS_ACCOUNT_REQUIRED') {
			// 	throw 'BUSINESS_ACCOUNT_REQUIRED';
			// }
			return [];
		}
	}
	static async fetchLabel(ids: string[], { vcf_only = false, business_contacts_only = false }) {
		try {
			const { data } = await APIInstance.get(
				`/whatsapp/labels/export?label_ids=${ids.join(',')}&vcf=${
					vcf_only ? 'true' : 'false'
				}&business_contacts_only=${business_contacts_only ? 'true' : 'false'}`,
				{ responseType: 'blob' }
			);
			const blob = new Blob([data], {
				type: vcf_only ? 'text/vcf' : 'text/csv',
			});

			// Create a temporary link element
			const downloadLink = document.createElement('a');
			downloadLink.href = window.URL.createObjectURL(blob);
			downloadLink.download = `Label Contacts.${vcf_only ? 'vcf' : 'csv'}`; // Specify the filename

			// Append the link to the body and trigger the download
			document.body.appendChild(downloadLink);
			downloadLink.click();

			// Clean up - remove the link
			document.body.removeChild(downloadLink);
		} catch (err) {
			return [];
		}
	}
	static async assignLabel(
		type: string,
		label_id: string,
		opts: { csv_file?: string; group_ids?: string[] }
	) {
		try {
			await APIInstance.post(`/whatsapp/labels/assign`, {
				type,
				label_id,
				...opts,
			});
			return true;
		} catch (err) {
			return false;
		}
	}
}
