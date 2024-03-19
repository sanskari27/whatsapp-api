import APIInstance from '../config/APIInstance';

type MergedGroupsDetails={
	id: string;
	name: string;
	groups: string[];
	group_reply_saved: {
		text: string;
		shared_contact_cards: string[];
		attachments: string[];
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
	};
	group_reply_unsaved: {
		text: string;
		shared_contact_cards: string[];
		attachments: string[];
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
	};
	private_reply_saved: {
		text: string;
		shared_contact_cards: string[];
		attachments: string[];
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
	};
	private_reply_unsaved: {
		text: string;
		shared_contact_cards: string[];
		attachments: string[];
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
	};
	restricted_numbers: string;

}

function processMergedGroup(group:any){
	return {
		id: group.id as string,
		name: group.name as string,
		groups: group.groups as string[],
		group_reply_saved: {
			text: group.group_reply_saved.text ?? '',
			shared_contact_cards: group.group_reply_saved.shared_contact_cards ?? [],
			attachments: group.group_reply_saved.attachments ?? [],
			polls: group.group_reply_saved.polls ?? [],
		},
		group_reply_unsaved: {
			text: group.group_reply_unsaved.text ?? '',
			shared_contact_cards: group.group_reply_unsaved.shared_contact_cards ?? [],
			attachments: group.group_reply_unsaved.attachments ?? [],
			polls: group.group_reply_unsaved.polls ?? [],
		},
		private_reply_saved: {
			text: group.private_reply_saved.text ?? '',
			shared_contact_cards: group.private_reply_saved.shared_contact_cards ?? [],
			attachments: group.private_reply_saved.attachments ?? [],
			polls: group.private_reply_saved.polls ?? [],
		},
		private_reply_unsaved: {
			text: group.private_reply_unsaved.text ?? '',
			shared_contact_cards: group.private_reply_unsaved.shared_contact_cards ?? [],
			attachments: group.private_reply_unsaved.attachments ?? [],
			polls: group.private_reply_unsaved.polls ?? [],
		},
		restricted_numbers: group.restricted_numbers ?? '',
	};
}

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
	static async fetchGroup(
		ids: string[],
		{
			vcf_only = false,
			business_contacts_only = false,
			saved_contacts = false,
			non_saved_contacts = false,
		}
	) {
		try {
			await APIInstance.post(`/whatsapp/groups/export`, {
				vcf: vcf_only,
				business_contacts_only,
				group_ids: ids,
				saved: saved_contacts,
				unsaved: non_saved_contacts,
			});
			return true;
		} catch (err) {
			return false;
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

	static async mergeGroups(details: {
		group_name: string;
		group_ids: string[];
		group_reply_saved: {
			text: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		};
		group_reply_unsaved: {
			text: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		};
		private_reply_saved: {
			text: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		};
		private_reply_unsaved: {
			text: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		};
		restricted_numbers: string;
	}) {
		try {
			const { data } = await APIInstance.post(`/whatsapp/groups/merge`, {
				group_name: details.group_name,
				group_ids: details.group_ids,
				group_reply_saved: details.group_reply_saved,
				group_reply_unsaved: details.group_reply_unsaved,
				private_reply_saved: details.private_reply_saved,
				private_reply_unsaved: details.private_reply_unsaved,
				restricted_numbers: '65f9c4211bcf06e245da1071',
			});
			return processMergedGroup(data.group);
			
		} catch (err) {
			throw new Error('Error Saving group');
		}
	}

	static async mergedGroups() {
		try {
			const { data } = await APIInstance.get(`/whatsapp/groups/merge`);
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return data.groups.map(processMergedGroup);
		} catch (err) {
			return [];
		}
	}

	static async editMergedGroup(
		id: string,details:{
		name: string,
		groups: string[],
		group_reply_saved: {
			text: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		},
		group_reply_unsaved: {
			text: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		},
		private_reply_saved: {
			text: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		},
		private_reply_unsaved: {
			text: string;
			shared_contact_cards: string[];
			attachments: string[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		},
		restricted_numbers: string
	}) {
		try {
			const { data } = await APIInstance.patch(`/whatsapp/groups/merge/${id}`, {
				group_name: details.name,
				group_ids: details.groups,
				group_reply_saved: details.group_reply_saved,
				group_reply_unsaved: details.group_reply_unsaved,
				private_reply_saved: details.private_reply_saved,
				private_reply_unsaved: details.private_reply_unsaved,
				restricted_numbers: '65f9c4211bcf06e245da1071',
			});
			return processMergedGroup(data.group);
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
			formData.append('groups[]', group);
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
