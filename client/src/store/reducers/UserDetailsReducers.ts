import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { UserDetailsState } from '../types/UserDetails';

const initialState: UserDetailsState = {
	name: '',
	phoneNumber: '',
	isSubscribed: false,
	subscriptionExpiration: '',
	userType: 'PERSONAL',
	canSendMessage: false,

	groups: [],
	labels: [],
	contactsCount: null,
	data_loaded: false,

	current_profile: '',
	profiles: [],

	ui_config: {
		load_preview: true,
		confirmation_required: true,
	},
};

const UserDetailsSlice = createSlice({
	name: StoreNames.USER,
	initialState,
	reducers: {
		reset: (state) => {
			state.name = initialState.name;
			state.phoneNumber = initialState.phoneNumber;
			state.isSubscribed = initialState.isSubscribed;
			state.canSendMessage = initialState.canSendMessage;
			state.subscriptionExpiration = initialState.subscriptionExpiration;
			state.userType = initialState.userType;

			state.groups = initialState.groups;
			state.labels = initialState.labels;

			state.current_profile = '';
			state.profiles = [];
		},
		setUserDetails: (state, action: PayloadAction<Partial<typeof initialState>>) => {
			if (action.payload.name) {
				state.name = action.payload.name;
			}
			if (action.payload.phoneNumber) {
				state.phoneNumber = action.payload.phoneNumber;
			}
			if (action.payload.isSubscribed) {
				state.isSubscribed = action.payload.isSubscribed;
			}
			if (action.payload.canSendMessage) {
				state.canSendMessage = action.payload.canSendMessage;
			}
			if (action.payload.subscriptionExpiration) {
				state.subscriptionExpiration = action.payload.subscriptionExpiration;
			}
			if (action.payload.userType) {
				state.userType = action.payload.userType;
			}

			if (action.payload.groups) {
				state.groups = action.payload.groups;
			}
			if (action.payload.labels) {
				state.labels = action.payload.labels;
			}
			if (action.payload.contactsCount) {
				state.contactsCount = action.payload.contactsCount;
			}
			if (action.payload.data_loaded !== undefined) {
				state.data_loaded = action.payload.data_loaded;
			}
			if (action.payload.profiles !== undefined) {
				state.profiles = action.payload.profiles;
			}
			if (action.payload.current_profile !== undefined) {
				state.current_profile = action.payload.current_profile;
			}
		},
		setName: (state, action: PayloadAction<typeof initialState.name>) => {
			state.name = action.payload;
		},
		setPhoneNumber: (state, action: PayloadAction<typeof initialState.phoneNumber>) => {
			state.phoneNumber = action.payload;
		},
		setIsSubscribed: (state, action: PayloadAction<typeof initialState.isSubscribed>) => {
			state.isSubscribed = action.payload;
		},
		setSubscriptionExpiration: (
			state,
			action: PayloadAction<typeof initialState.subscriptionExpiration>
		) => {
			state.subscriptionExpiration = action.payload;
		},
		setUserType: (state, action: PayloadAction<typeof initialState.userType>) => {
			state.userType = action.payload;
		},
		setGroups: (state, action: PayloadAction<typeof initialState.groups>) => {
			state.groups = action.payload;
		},
		setLabels: (state, action: PayloadAction<typeof initialState.labels>) => {
			state.labels = action.payload;
		},
		setContactsCount: (state, action: PayloadAction<typeof initialState.contactsCount>) => {
			state.contactsCount = action.payload;
		},
		setDataLoaded: (state, action: PayloadAction<typeof initialState.data_loaded>) => {
			state.data_loaded = action.payload;
		},
		setCurrentProfile: (state, action: PayloadAction<typeof initialState.current_profile>) => {
			state.current_profile = action.payload;
		},

		setUserConfig: (state, action: PayloadAction<Partial<typeof initialState.ui_config>>) => {
			for (const key in action.payload) {
				if (Object.prototype.hasOwnProperty.call(action.payload, key)) {
					const typedKey = key as keyof typeof action.payload;
					state.ui_config[typedKey] = action.payload[typedKey]!;
				}
			}
		},
	},
});

export const {
	reset,
	setUserDetails,
	setName,
	setPhoneNumber,
	setIsSubscribed,
	setSubscriptionExpiration,
	setUserType,
	setGroups,
	setLabels,
	setContactsCount,
	setDataLoaded,
	setCurrentProfile,
	setUserConfig,
} = UserDetailsSlice.actions;

export default UserDetailsSlice.reducer;
