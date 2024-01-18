import APIInstance from '../config/APIInstance';

export default class GroupService {
	static async listGroups() {
		try {
			const { data } = await APIInstance.get(`/whatsapp/groups`);
			return data.groups as {
				id: string;
				name: string;
			}[];
		} catch (err) {
			return [];
		}
	}
	static async fetchGroup(ids: string[], { vcf_only = false, business_contacts_only = false }) {
		try {
			const { data } = await APIInstance.get(
				`/whatsapp/groups/export?group_ids=${ids.join(',')}&vcf=${
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
			downloadLink.download = `Group Contacts.${vcf_only ? 'vcf' : 'csv'}`; // Specify the filename

			// Append the link to the body and trigger the download
			document.body.appendChild(downloadLink);
			downloadLink.click();

			// Clean up - remove the link
			document.body.removeChild(downloadLink);
		} catch (err) {
			//ignore
		}
	}
	static async createGroup(name: string, csv_file: string) {
		try {
			await APIInstance.post(`/whatsapp/groups`, { name, csv_file });
			return true;
		} catch (err) {
			return false;
		}
	}
}
