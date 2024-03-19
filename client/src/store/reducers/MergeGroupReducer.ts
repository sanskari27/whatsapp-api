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
		group_reply_saved: {
			text: '',
			shared_contact_cards: [],
			attachments: [],
			polls: [],
		},
		group_reply_unsaved: {
			text: '',
			shared_contact_cards: [],
			attachments: [],
			polls: [],
		},
		private_reply_saved: {
			text: '',
			shared_contact_cards: [],
			attachments: [],
			polls: [],
		},
		private_reply_unsaved: {
			text: '',
			shared_contact_cards: [],
			attachments: [],
			polls: [],
		},
		restricted_numbers: '',
	},
	uiDetails: {
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
			console.log(action.payload)
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
			const index = state.list.findIndex((group) => group.id === action.payload.id);
			state.list[index] = action.payload;
			state.uiDetails.isUpdating = false;
		},
		setName: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.name = action.payload;
		},
		setGroups: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.groups.push(action.payload);
		},
		setGroupReplySavedText: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.group_reply_saved.text = action.payload;
		},
		setGroupReplyUnsavedText: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.group_reply_unsaved.text = action.payload;
		},
		setPrivateReplySavedText: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.private_reply_saved.text = action.payload;
		},
		setPrivateReplyUnsavedText: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.private_reply_unsaved.text = action.payload;
		},
		setGroupReplySavedSharedContactCards: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.group_reply_saved.shared_contact_cards.push(action.payload);
		},
		setGroupReplyUnsavedSharedContactCards: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.group_reply_unsaved.shared_contact_cards.push(action.payload);
		},
		setPrivateReplySavedSharedContactCards: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.private_reply_saved.shared_contact_cards.push(action.payload);
		},
		setPrivateReplyUnsavedSharedContactCards: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.private_reply_unsaved.shared_contact_cards.push(action.payload);
		},
		setGroupReplySavedAttachments: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.group_reply_saved.attachments.push(action.payload);
		},
		setGroupReplyUnsavedAttachments: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.group_reply_unsaved.attachments.push(action.payload);
		},
		setPrivateReplySavedAttachments: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.private_reply_saved.attachments.push(action.payload);
		},
		setPrivateReplyUnsavedAttachments: (state, action: PayloadAction<string>) => {
			state.editSelectedGroup.private_reply_unsaved.attachments.push(action.payload);
		},
		setGroupReplySavedPolls: (state, action: PayloadAction<(typeof initialState.editSelectedGroup.group_reply_saved.polls)[0]>) => {
			state.editSelectedGroup.group_reply_saved.polls.push(action.payload);
		},
		setGroupReplyUnsavedPolls: (state, action: PayloadAction<(typeof initialState.editSelectedGroup.group_reply_unsaved.polls)[0]>) => {
			state.editSelectedGroup.group_reply_unsaved.polls.push(action.payload);
		},
		setPrivateReplySavedPolls: (state, action: PayloadAction<(typeof initialState.editSelectedGroup.private_reply_saved.polls)[0]>) => {
			state.editSelectedGroup.private_reply_saved.polls.push(action.payload);
		},
		setPrivateReplyUnsavedPolls: (state, action: PayloadAction<(typeof initialState.editSelectedGroup.private_reply_unsaved.polls)[0]>) => {
			state.editSelectedGroup.private_reply_unsaved.polls.push(action.payload);
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
	setGroupReplySavedText,
	setGroupReplyUnsavedText,
	setPrivateReplySavedText,
	setPrivateReplyUnsavedText,
	setGroupReplySavedSharedContactCards,
	setGroupReplyUnsavedSharedContactCards,
	setPrivateReplySavedSharedContactCards,
	setPrivateReplyUnsavedSharedContactCards,
	setGroupReplySavedAttachments,
	setGroupReplyUnsavedAttachments,
	setPrivateReplySavedAttachments,
	setPrivateReplyUnsavedAttachments,
	setGroupReplySavedPolls,
	setGroupReplyUnsavedPolls,
	setPrivateReplySavedPolls,
	setPrivateReplyUnsavedPolls,
} = MergeGroupSlice.actions;

export default MergeGroupSlice.reducer;
