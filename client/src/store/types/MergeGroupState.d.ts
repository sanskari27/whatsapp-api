export type MergeGroupState = {
	list: MergedGroup[];
	selectedGroups: string[];
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
	groups: {
		id: string;
		name: string;
	}[];
};
