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
		},
		setUserDetails: (state, action: PayloadAction<typeof initialState>) => {
			state.name = action.payload.name;
			state.phoneNumber = action.payload.phoneNumber;
			state.isSubscribed = action.payload.isSubscribed;
			state.canSendMessage = action.payload.canSendMessage;
			state.subscriptionExpiration = action.payload.subscriptionExpiration;
			state.userType = action.payload.userType;

			state.groups = action.payload.groups;
			state.labels = action.payload.labels;
			state.contactsCount = action.payload.contactsCount;
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
} = UserDetailsSlice.actions;

export default UserDetailsSlice.reducer;
