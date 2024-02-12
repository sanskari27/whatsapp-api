import APIInstance from '../config/APIInstance';

export default class GroupService {
	static async listGroups() {
		try {
			const { data } = await APIInstance.get(`/whatsapp/groups`);
			return data.groups.map(
				(group: { id: string; name: string; isMergedGroup: boolean; participants: number }) => ({
					id: group.id,
					name: group.name,
					isMergedGroup: group.isMergedGroup,
					participants: group.participants ?? 0,
				})
			) as { id: string; name: string; isMergedGroup: boolean; participants: number }[];
		} catch (err) {
			return [];
		}
	}
	static async refreshGroups() {
		try {
			const { data } = await APIInstance.post(`/whatsapp/groups/refresh`);
			return data.groups.map(
				(group: { id: string; name: string; isMergedGroup: boolean; participants: number }) => ({
					id: group.id,
					name: group.name,
					isMergedGroup: group.isMergedGroup,
					participants: group.participants ?? 0,
				})
			) as { id: string; name: string; isMergedGroup: boolean; participants: number }[];
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

	static async mergeGroups(
		group_name: string,
		group_ids: string[],
		{
			group_reply,
			private_reply,
		}: {
			group_reply: {
				saved: string;
				unsaved: string;
			};
			private_reply: {
				saved: string;
				unsaved: string;
			};
		}
	) {
		try {
			const { data } = await APIInstance.post(`/whatsapp/groups/merge`, {
				group_name,
				group_ids,
				group_reply: group_reply,
				private_reply: private_reply,
			});
			return {
				id: data.group.id as string,
				name: data.group.name as string,
				groups: data.group.groups as string[],
				group_reply: (data.group.group_reply ?? { saved: '', unsaved: '' }) as {
					saved: string;
					unsaved: string;
				},
				private_reply: (data.group.private_reply ?? { saved: '', unsaved: '' }) as {
					saved: string;
					unsaved: string;
				},
			};
		} catch (err) {
			throw new Error('Error Saving group');
		}
	}

	static async mergedGroups() {
		try {
			const { data } = await APIInstance.get(`/whatsapp/groups/merge`);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return data.groups.map((group: any) => ({
				id: group.id as string,
				name: group.name as string,
				groups: group.groups as string[],
				group_reply: (group.group_reply ?? { saved: '', unsaved: '' }) as {
					saved: string;
					unsaved: string;
				},
				private_reply: (group.private_reply ?? { saved: '', unsaved: '' }) as {
					saved: string;
					unsaved: string;
				},
			}));
		} catch (err) {
			return [];
		}
	}

	static async editMergedGroup(
		id: string,
		name: string,
		groups: string[],
		{
			group_reply,
			private_reply,
		}: {
			group_reply: {
				saved: string;
				unsaved: string;
			};
			private_reply: {
				saved: string;
				unsaved: string;
			};
		}
	) {
		try {
			const { data } = await APIInstance.patch(`/whatsapp/groups/merge/${id}`, {
				group_name: name,
				group_ids: groups,
				group_reply: group_reply,
				private_reply: private_reply,
			});
			return {
				id: data.group.id as string,
				name: data.group.name as string,
				groups: data.group.groups as string[],
				group_reply: (data.group.group_reply ?? { saved: '', unsaved: '' }) as {
					saved: string;
					unsaved: string;
				},
				private_reply: (data.group.private_reply ?? { saved: '', unsaved: '' }) as {
					saved: string;
					unsaved: string;
				},
			};
		} catch (err) {
			throw new Error('Error Saving group');
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

	static async addProfilePicture(file: File, selectedGroups: string[]) {
		const formData = new FormData();
		formData.append('file', file);
		for (const group of selectedGroups) {
			formData.append('groups', group);
		}
		await APIInstance.put(`/whatsapp/groups`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});
		return true;
	}

	static async updateProfileSettings(
		{
			description,
			edit_group_settings,
			send_messages,
			add_others,
			admin_group_settings,
		}: Partial<{
			description: string;
			edit_group_settings: boolean;
			send_messages: boolean;
			add_others: boolean;
			admin_group_settings: boolean;
		}>,
		selectedGroups: string[]
	) {
		await APIInstance.patch(`/whatsapp/groups`, {
			description,
			edit_group_settings,
			send_messages,
			add_others,
			admin_group_settings,
			groups: selectedGroups,
		});
		return true;
	}
}
