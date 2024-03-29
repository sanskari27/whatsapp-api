export type UsersState = {
	list: User[];
	selectedUsers: string[];
	uiDetails: {
		isSaving: boolean;
		isFetching: boolean;
		isDeleting: boolean;
		isCreating: boolean;
		isUpdating: boolean;
		error: string;
	};
};

type User = {
	id: string;
	name: string;
	phone: string;
	type: 'BUSINESS' | 'PERSONAL';
	subscription_expiry: string;
};
