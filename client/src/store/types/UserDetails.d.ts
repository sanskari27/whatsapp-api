import { EXPORTS_TYPE } from '../../config/const';

export type UserDetailsState = {
	name: string;
	username: string;
	phoneNumber: string;
	isSubscribed: boolean;
	subscriptionExpiration: string;
	current_profile_type: 'BUSINESS' | 'PERSONAL';

	groups: {
		id: string;
		name: string;
		isMergedGroup: boolean;
		participants: number;
	}[];
	labels: {
		id: string;
		name: string;
	}[];
	contactsCount: {
		[EXPORTS_TYPE.ALL]: number;
		[EXPORTS_TYPE.SAVED]: number;
		[EXPORTS_TYPE.UNSAVED]: number;
		[EXPORTS_TYPE.SAVED_CHAT]: number;
	} | null;

	data_loaded: boolean;

	current_profile: string;
	profiles: Profile[];
	max_profiles: number;

	ui_config: {
		load_preview: boolean;
		confirmation_required: boolean;
	};
};

export type PaymentRecords = {
	subscriptions: [];
	payments: [];
};

export type Profile = {
	phone: string;
	name: string;
	userType: 'BUSINESS' | 'PERSONAL';
	business_details: {
		description: string;
		email: string;
		websites: string[];
		latitude: number;
		longitude: number;
		address: string;
	};
	client_id: string;
};
