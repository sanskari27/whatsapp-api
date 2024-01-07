import APIInstance from '../config/APIInstance';

export default class ContactService {
	static async contactCount() {
		const { data } = await APIInstance.get(`/whatsapp/contacts/count`);
		return {
			saved: data.saved_contacts as number,
			unsaved: data.non_saved_contacts as number,
			total: data.total_contacts as number,
		};
	}
	static async contacts({
		saved_contacts = false,
		non_saved_contacts = false,
		vcf_only = false,
		business_contacts_only = false,
	}) {
		try {
			const response = await APIInstance.get(
				`/whatsapp/contacts?saved_contacts=${
					saved_contacts ? 'true' : 'false'
				}&non_saved_contacts=${non_saved_contacts ? 'true' : 'false'}&vcf=${
					vcf_only ? 'true' : 'false'
				}&business_contacts_only=${business_contacts_only ? 'true' : 'false'}`,
				{ responseType: 'blob' }
			);
			const blob = new Blob([response.data], { type: vcf_only ? 'text/vcf' : 'text/csv' });

			// Create a temporary link element
			const downloadLink = document.createElement('a');
			downloadLink.href = window.URL.createObjectURL(blob);
			downloadLink.download = `Contacts.${vcf_only ? 'vcf' : 'csv'}`; // Specify the filename

			// Append the link to the body and trigger the download
			document.body.appendChild(downloadLink);
			downloadLink.click();

			// Clean up - remove the link
			document.body.removeChild(downloadLink);
		} catch (err) {
			return [];
		}
	}
}
