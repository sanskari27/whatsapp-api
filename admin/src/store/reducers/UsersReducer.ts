import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '../../../../client/src/store';
import { UsersState } from '../types/UsersState';

const initialState: UsersState = {
	list: [],
	selectedUsers: [],
	uiDetails: {
		isSaving: false,
		isFetching: false,
		isDeleting: false,
		isCreating: false,
		isUpdating: false,
		error: '',
	},
};

const UsersSlice = createSlice({
	name: StoreNames.MERGE_GROUP,
	initialState,
	reducers: {
		reset: (state) => {
			state.list = initialState.list;
			state.selectedUsers = initialState.selectedUsers;
			state.uiDetails = initialState.uiDetails;
		},
		setUsersList: (state, action: PayloadAction<typeof initialState.list>) => {
			state.list = action.payload;
		},
		addSelectedUsers: (state, action: PayloadAction<string>) => {
			state.selectedUsers.push(action.payload);
		},
		removeSelectedUsers: (state, action: PayloadAction<string>) => {
			state.selectedUsers = state.selectedUsers.filter((id) => id !== action.payload);
		},
		startSaving: (state) => {
			state.uiDetails.isSaving = true;
		},
		stopSaving: (state) => {
			state.uiDetails.isSaving = false;
		},
		setIsFetching: (state, action: PayloadAction<typeof initialState.uiDetails.isFetching>) => {
			state.uiDetails.isFetching = action.payload;
		},
		setIsDeleting: (state, action: PayloadAction<typeof initialState.uiDetails.isDeleting>) => {
			state.uiDetails.isDeleting = action.payload;
		},
		setIsCreating: (state, action: PayloadAction<typeof initialState.uiDetails.isCreating>) => {
			state.uiDetails.isCreating = action.payload;
		},
		setIsUpdating: (state, action: PayloadAction<typeof initialState.uiDetails.isUpdating>) => {
			state.uiDetails.isUpdating = action.payload;
		},
		setError: (state, action: PayloadAction<typeof initialState.uiDetails.error>) => {
			state.uiDetails.error = action.payload;
		},
	},
});

export const {
	reset,
	startSaving,
	stopSaving,
	setIsFetching,
	setIsDeleting,
	setIsCreating,
	setIsUpdating,
	setError,
	addSelectedUsers,
	removeSelectedUsers,
	setUsersList,
} = UsersSlice.actions;

export default UsersSlice.reducer;
