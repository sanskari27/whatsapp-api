import APIInstance from '../config/APIInstance';

export default class GroupService {
	static async listGroups() {
		try {
			const { data } = await APIInstance.get(`/whatsapp/groups`);
			return data.groups as {
				id: string;
				name: string;
				isMergedGroup: boolean;
			}[];
		} catch (err) {
			return [];
		}
	}
	static async fetchGroup(ids: string[], { vcf_only = false, business_contacts_only = false }) {
		try {
			const { data } = await APIInstance.post(
				`/whatsapp/groups/export`,
				{
					vcf_only,
					business_contacts_only,
					group_ids: ids,
				},
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

	static async mergeGroups(group_name: string, group_ids: string[], group_reply: string) {
		try {
			const { data } = await APIInstance.post(`/whatsapp/groups/merge`, {
				group_name,
				group_ids,
				group_reply,
			});
			return {
				id: data.group.id as string,
				name: data.group.name as string,
				groups: data.group.groups as string[],
				group_reply: data.group.group_reply as string,
			};
		} catch (err) {
			return null;
		}
	}

	static async mergedGroups() {
		try {
			const { data } = await APIInstance.get(`/whatsapp/groups/merge`);
			return data.groups as {
				id: string;
				name: string;
				isMergedGroup: boolean;
				groups: string[];
				group_reply: string;
			}[];
		} catch (err) {
			return [];
		}
	}

	static async editMergedGroup(id: string, name: string, groups: string[], groups_reply: string) {
		try {
			const { data } = await APIInstance.patch(`/whatsapp/groups/merge/${id}`, {
				group_name: name,
				group_ids: groups,
				groups_reply: groups_reply,
			});
			return {
				id: data.group.id as string,
				name: data.group.name as string,
				groups: data.group.groups as string[],
				group_reply: data.group.group_reply as string,
			};
		} catch (err) {
			return null;
		}
	}

	static async deleteMerged(id: string) {
		try {
			await APIInstance.delete(`/whatsapp/groups/merge/${id}`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
