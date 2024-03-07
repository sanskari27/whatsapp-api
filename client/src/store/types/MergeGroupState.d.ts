export type MergeGroupState = {
	list: MergedGroup[];
	selectedGroups: string[];
	editSelectedGroup: MergedGroup;
	uiDetails: {
		searchText: string;
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
	group_reply: {
		saved: string;
		unsaved: string;
	};
	private_reply: {
		saved: string;
		unsaved: string;
	};
};
