export type ContactCardState = {
	list: {
		base64?: string;
		id: string;
		first_name: string;
		middle_name?: string;
		last_name?: string;
		title?: string;
		organization?: string;
		email_personal?: string;
		email_work?: string;
		contact_details_phone?: {
			country_code: string;
			number: string;
		};
		contact_details_work?: {
			country_code: string;
			number: string;
		};
		contact_details_other?: {
			country_code: string;
			number: string;
		}[];
		links?: string[];
		street?: string;
		city?: string;
		state?: string;
		country?: string;
		pincode?: string;
	}[];
	selectedCard: {
		id: string;
		first_name: string;
		middle_name?: string;
		last_name?: string;
		title?: string;
		organization?: string;
		email_personal?: string;
		email_work?: string;
		contact_details_phone?: {
			country_code: string;
			number: string;
		};
		contact_details_work?: {
			country_code: string;
			number: string;
		};
		contact_details_other?: {
			country_code: string;
			number: string;
		}[];
		links?: string[];
		street?: string;
		city?: string;
		state?: string;
		country?: string;
		pincode?: string;
	};
	uiDetails: {
		searchText: string;
		isSaving: boolean;
		isFetching: boolean;
		isDeleting: boolean;
		isUpdating: boolean;
		error: string;
	};
	selectedContacts: string[];
};
