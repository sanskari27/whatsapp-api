import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { ContactCardState } from '../types/ContactCardState';

const initialState: ContactCardState = {
	list: [],
	selectedContacts: [],
	selectedCard: {
		id: '',
		first_name: '',
		middle_name: '',
		last_name: '',
		title: '',
		organization: '',
		email_personal: '',
		email_work: '',
		contact_phone: {
			country_code: '91',
			number: '',
		},
		contact_work: {
			country_code: '91',
			number: '',
		},
		contact_other: [],
		links: [],
		street: '',
		city: '',
		state: '',
		country: '',
		pincode: '',
	},
	uiDetails: {
		searchText: '',
		error: '',
		isFetching: false,
		isSaving: false,
		isDeleting: false,
		isUpdating: false,
	},
};

const ContactCardReducers = createSlice({
	name: StoreNames.CONTACT_CARD,
	initialState: initialState,
	reducers: {
		reset: (state) => {
			state.list = initialState.list;
			state.selectedCard = initialState.selectedCard;
			state.uiDetails = initialState.uiDetails;
		},
		setContactList: (state, action: PayloadAction<typeof initialState.list>) => {
			state.list = action.payload;
		},
		addContactCard: (state, action: PayloadAction<typeof initialState.selectedCard>) => {
			state.list.push(action.payload);
			state.selectedCard = initialState.selectedCard;
			state.uiDetails = initialState.uiDetails;
		},
		updateContactCard: (state, action: PayloadAction<typeof initialState.selectedCard>) => {
			state.list = state.list.map((card) =>
				card.id === action.payload.id ? action.payload : card
			);
			state.selectedCard = initialState.selectedCard;
			state.uiDetails = initialState.uiDetails;
		},
		deleteContactCard: (state, action: PayloadAction<string>) => {
			state.list = state.list.filter((card) => card.id !== action.payload);
			state.selectedCard = initialState.selectedCard;
			state.uiDetails = initialState.uiDetails;
		},
		removeAllSelectedContacts: (state) => {
			state.selectedContacts = [];
		},
		clearContactCard: (state) => {
			state.selectedCard = initialState.selectedCard;
			state.uiDetails = initialState.uiDetails;
		},
		findContactById: (state, action: PayloadAction<typeof initialState.selectedCard.id>) => {
			state.selectedCard = state.list.find((card) => card.id === action.payload)!;
		},
		setFirstName: (state, action: PayloadAction<typeof initialState.selectedCard.first_name>) => {
			state.selectedCard.first_name = action.payload;
		},
		setMiddleName: (state, action: PayloadAction<typeof initialState.selectedCard.middle_name>) => {
			state.selectedCard.middle_name = action.payload;
		},
		setLastName: (state, action: PayloadAction<typeof initialState.selectedCard.last_name>) => {
			state.selectedCard.last_name = action.payload;
		},
		setTitle: (state, action: PayloadAction<typeof initialState.selectedCard.title>) => {
			state.selectedCard.title = action.payload;
		},
		setOrganization: (
			state,
			action: PayloadAction<typeof initialState.selectedCard.organization>
		) => {
			state.selectedCard.organization = action.payload;
		},
		setEmailPersonal: (
			state,
			action: PayloadAction<typeof initialState.selectedCard.email_personal>
		) => {
			state.selectedCard.email_personal = action.payload;
		},
		setEmailWork: (state, action: PayloadAction<typeof initialState.selectedCard.email_work>) => {
			state.selectedCard.email_work = action.payload;
		},
		setContactNumberPhone: (
			state,
			action: PayloadAction<typeof initialState.selectedCard.contact_phone>
		) => {
			state.selectedCard.contact_phone = action.payload;
		},
		setContactNumberWork: (
			state,
			action: PayloadAction<typeof initialState.selectedCard.contact_work>
		) => {
			state.selectedCard.contact_work = action.payload;
		},
		setContactNumberOther: (
			state,
			action: PayloadAction<{
				index: number;
				country_code: string;
				number: string;
			}>
		) => {
			state.selectedCard.contact_other![action.payload.index] = {
				country_code: action.payload.country_code,
				number: action.payload.number,
			};
		},
		addContactNumberOther: (
			state,
			action: PayloadAction<{ country_code: string; number: string }>
		) => {
			state.selectedCard.contact_other?.push(action.payload);
		},
		removeContactNumberOther: (state, action: PayloadAction<number>) => {
			state.selectedCard.contact_other = state.selectedCard.contact_other?.filter(
				(_, index) => index !== action.payload
			);
		},
		setLinks: (state, action: PayloadAction<{ index: number; url: string }>) => {
			state.selectedCard.links![action.payload.index] = action.payload.url;
		},
		addLink: (state, action: PayloadAction<string>) => {
			state.selectedCard.links?.push(action.payload);
		},
		removeLink: (state, action: PayloadAction<number>) => {
			state.selectedCard.links = state.selectedCard.links?.filter(
				(_, index) => index !== action.payload
			);
		},
		setCity: (state, action: PayloadAction<typeof initialState.selectedCard.city>) => {
			state.selectedCard.city = action.payload;
		},
		setCountry: (state, action: PayloadAction<typeof initialState.selectedCard.country>) => {
			state.selectedCard.country = action.payload;
		},
		setPincode: (state, action: PayloadAction<typeof initialState.selectedCard.pincode>) => {
			state.selectedCard.pincode = action.payload;
		},
		setState: (state, action: PayloadAction<typeof initialState.selectedCard.state>) => {
			state.selectedCard.state = action.payload;
		},
		setStreet: (state, action: PayloadAction<typeof initialState.selectedCard.street>) => {
			state.selectedCard.street = action.payload;
		},
		fetchingContactCard: (state) => {
			state.uiDetails.isFetching = true;
		},
		stopFetchingContactCard: (state) => {
			state.uiDetails.isFetching = false;
		},
		savingContactCard: (state) => {
			state.uiDetails.isSaving = true;
		},
		stopSavingContactCard: (state) => {
			state.uiDetails.isSaving = false;
		},
		deletingContactCard: (state) => {
			state.uiDetails.isDeleting = true;
		},
		stopDeletingContactCard: (state) => {
			state.uiDetails.isDeleting = false;
		},
		updatingContactCard: (state) => {
			state.uiDetails.isUpdating = true;
		},
		stopUpdatingContactCard: (state) => {
			state.uiDetails.isUpdating = false;
		},
		setError: (state, action: PayloadAction<string>) => {
			state.uiDetails.error = action.payload;
		},
		addSelectedContact: (state, action: PayloadAction<string>) => {
			state.selectedContacts.push(action.payload);
		},
		selectAllContacts: (state) => {
			state.selectedContacts = state.list.map((el) => el.id);
		},
		removeSelectedContact: (state, action: PayloadAction<string>) => {
			state.selectedContacts = state.selectedContacts.filter((el) => el !== action.payload);
		},

		setSearchText: (state, action: PayloadAction<string>) => {
			state.uiDetails.searchText = action.payload;
		},
	},
});

export const {
	reset,
	setContactList,
	addContactCard,
	updateContactCard,
	clearContactCard,
	findContactById,
	setFirstName,
	setMiddleName,
	setLastName,
	setTitle,
	setOrganization,
	removeAllSelectedContacts,
	setEmailPersonal,
	setEmailWork,
	setContactNumberPhone,
	setContactNumberWork,
	setContactNumberOther,
	addContactNumberOther,
	addLink,
	removeLink,
	setCity,
	setCountry,
	setPincode,
	setState,
	setStreet,
	fetchingContactCard,
	stopFetchingContactCard,
	savingContactCard,
	stopSavingContactCard,
	deletingContactCard,
	stopDeletingContactCard,
	updatingContactCard,
	stopUpdatingContactCard,
	setError,
	removeContactNumberOther,
	setLinks,
	deleteContactCard,
	addSelectedContact,
	selectAllContacts,
	removeSelectedContact,
	setSearchText,
} = ContactCardReducers.actions;

export default ContactCardReducers.reducer;
