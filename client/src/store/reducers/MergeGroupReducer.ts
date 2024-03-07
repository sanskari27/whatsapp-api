import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { MergeGroupState } from '../types/MergeGroupState';

const initialState: MergeGroupState = {
	list: [],
	selectedGroups: [],
	editSelectedGroup: {
		id: '',
		name: '',
		groups: [],
		group_reply: {
			saved: '',
			unsaved: '',
		},
		private_reply: {
			saved: '',
			unsaved: '',
		},
	},
	uiDetails: {
		searchText: '',
		isSaving: false,
		isFetching: false,
		isDeleting: false,
		isCreating: false,
		isUpdating: false,
		error: '',
	},
};

const MergeGroupSlice = createSlice({
	name: StoreNames.MERGE_GROUP,
	initialState,
	reducers: {
		reset: (state) => {
			state.list = initialState.list;
			state.selectedGroups = initialState.selectedGroups;
			state.uiDetails = initialState.uiDetails;
		},
		setMergedGroupList: (state, action: PayloadAction<typeof initialState.list>) => {
			state.list = action.payload;
		},
		addMergedGroup: (state, action: PayloadAction<(typeof initialState.list)[0]>) => {
			state.list.push(action.payload);
			state.uiDetails.isSaving = false;
		},
		addSelectedGroups: (state, action: PayloadAction<string>) => {
			state.selectedGroups.push(action.payload);
		},
		addAllGroups: (state) => {
			state.selectedGroups = state.list.map((group) => group.id);
		},
		removeSelectedGroups: (state, action: PayloadAction<string>) => {
			state.selectedGroups = state.selectedGroups.filter((id) => id !== action.payload);
		},
		addSelectedGroup: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.groups.push(action.payload);
		},
		removeSelectedGroup: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.groups = state.editSelectedGroup.groups.filter(
				(id) => id !== action.payload
			);
		},
		clearSelectedGroup: (state) => {
			state.selectedGroups = [];
		},
		deleteMergedGroup: (state, action: PayloadAction<string>) => {
			state.list = state.list.filter((merged_group) => merged_group.id !== action.payload);
			state.selectedGroups = initialState.selectedGroups.filter((id) => id !== action.payload);
			state.uiDetails.isDeleting = false;
		},
		editSelectedGroup: (state, action: PayloadAction<string>) => {
			const group = state.list.find((g) => g.id === action.payload);
			if (group) {
				state.editSelectedGroup.id = group.id;
				state.editSelectedGroup.name = group.name;
				state.editSelectedGroup.groups = group.groups;
			}
		},
		updateMergeGroupsList: (state, action: PayloadAction<(typeof initialState.list)[0]>) => {
			state.list = state.list.map((group) => {
				if (group.id === action.payload.id) {
					return {
						id: action.payload.id,
						name: action.payload.name,
						groups: action.payload.groups,
						group_reply: action.payload.group_reply ?? { saved: '', unsaved: '' },
						private_reply: action.payload.private_reply ?? { saved: '', unsaved: '' },
					};
				}
				return group;
			});
			state.uiDetails.isUpdating = false;
		},
		setName: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.name = action.payload;
		},
		setGroups: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.groups.push(action.payload);
		},
		setGroupReplySaved: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.group_reply.saved = action.payload;
		},
		setGroupReplyUnsaved: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.group_reply.unsaved = action.payload;
		},
		setPrivateReplySaved: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.private_reply.saved = action.payload;
		},
		setPrivateReplyUnsaved: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.private_reply.unsaved = action.payload;
		},
		clearEditMergeGroup: (state) => {
			state.editSelectedGroup = initialState.editSelectedGroup;
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

		setSearchText: (state, action: PayloadAction<string>) => {
			state.uiDetails.searchText = action.payload;
		},
	},
});

export const {
	reset,
	setMergedGroupList,
	addMergedGroup,
	addSelectedGroups,
	addAllGroups,
	removeSelectedGroups,
	clearSelectedGroup,
	addSelectedGroup,
	removeSelectedGroup,
	deleteMergedGroup,
	editSelectedGroup,
	clearEditMergeGroup,
	updateMergeGroupsList,
	setName,
	setGroups,
	startSaving,
	stopSaving,
	setIsFetching,
	setIsDeleting,
	setIsCreating,
	setIsUpdating,
	setError,
	setGroupReplySaved,
	setGroupReplyUnsaved,
	setPrivateReplySaved,
	setPrivateReplyUnsaved,
	setSearchText,
} = MergeGroupSlice.actions;

export default MergeGroupSlice.reducer;
