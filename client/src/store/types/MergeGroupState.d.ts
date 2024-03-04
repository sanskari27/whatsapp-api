export type MergeGroupState = {
	list: MergedGroup[];
	selectedGroups: string[];
	editSelectedGroup: MergedGroup;
	uiDetails: {
		isSaving: boolean;
		isFetching: boolean;
		isDeleting: boolean;
		isCreating: boolean;
		isUpdating: boolean;
		error: string;
	};
};

type MergedGroup = {
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
};
