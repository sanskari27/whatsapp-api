import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { AttachmentState } from '../types/AttachmentState';

const initialState: AttachmentState = {
	attachments: [],
	selectedAttachments: [],
	selectedAttachment: {
		caption: '',
		filename: '',
		custom_caption: false,
		id: '',
		name: '',
	},
	file: null,
	size: '',
	type: '',
	url: '',
	uiDetails: {
		isSaving: false,
		isDeleting: false,
		isUpdating: false,
		errorMessage: '',
		searchText: '',
	},
};

const AttachmentSlice = createSlice({
	name: StoreNames.ATTACHMENT,
	initialState,
	reducers: {
		reset: (state) => {
			state.attachments = initialState.attachments;
			state.selectedAttachment = initialState.selectedAttachment;
			state.uiDetails = initialState.uiDetails;
			state.file = initialState.file;
		},
		setAttachments: (state, action: PayloadAction<typeof initialState.attachments>) => {
			state.attachments = action.payload;
		},
		addAttachment: (state, action: PayloadAction<typeof initialState.selectedAttachment>) => {
			if (!action.payload) {
				return;
			}
			state.attachments.push(action.payload);
			state.selectedAttachment = initialState.selectedAttachment;
			state.uiDetails = initialState.uiDetails;
			state.file = initialState.file;
		},
		findAttachmentById: (state, action: PayloadAction<string>) => {
			state.selectedAttachment =
				state.attachments.find((attachment) => attachment.id === action.payload) ??
				state.selectedAttachment;
		},
		updateAttachment: (state, action: PayloadAction<typeof initialState.selectedAttachment>) => {
			const payload = action.payload;

			state.attachments = state.attachments.map((attachment) =>
				attachment.id === payload.id ? payload : attachment
			);
			state.selectedAttachment = initialState.selectedAttachment;
			state.uiDetails = initialState.uiDetails;
			state.file = initialState.file;
		},
		setSelectedAttachment: (state, action: PayloadAction<{ id: string }>) => {
			state.selectedAttachment =
				state.attachments.find((attachment) => attachment.id === action.payload.id) ??
				state.selectedAttachment;
		},
		clearSelectedAttachment: (state) => {
			state.selectedAttachment = initialState.selectedAttachment;
			state.uiDetails = initialState.uiDetails;
			state.file = initialState.file;
		},
		setFile: (
			state,
			action: PayloadAction<{
				file: typeof initialState.file;
				type: string;
				size: string;
				url: string;
			}>
		) => {
			state.file = action.payload.file;
			state.type = action.payload.type;
			state.url = action.payload.url;
			state.size = action.payload.size;
			state.uiDetails.errorMessage = '';
		},
		removeFile: (state) => {
			state.file = null;
			state.type = '';
			state.url = '';
			state.size = '';
		},
		setName: (state, action: PayloadAction<typeof initialState.selectedAttachment.name>) => {
			state.selectedAttachment.name = action.payload;
			state.uiDetails.errorMessage = '';
		},
		setCaption: (state, action: PayloadAction<typeof initialState.selectedAttachment.caption>) => {
			state.selectedAttachment.caption = action.payload;
		},
		setCustomCaption: (
			state,
			action: PayloadAction<typeof initialState.selectedAttachment.custom_caption>
		) => {
			state.selectedAttachment.custom_caption = action.payload;
		},
		setFileName: (
			state,
			action: PayloadAction<typeof initialState.selectedAttachment.filename>
		) => {
			state.selectedAttachment.filename = action.payload;
		},
		startAttachmentSaving: (state) => {
			state.uiDetails.isSaving = true;
		},
		startAttachmentDeleting: (state) => {
			state.uiDetails.isDeleting = true;
		},
		startAttachmentUpdating: (state) => {
			state.uiDetails.isUpdating = true;
		},
		setError: (state, action: PayloadAction<typeof initialState.uiDetails.errorMessage>) => {
			state.uiDetails.errorMessage = action.payload;
		},
		deleteAttachment: (state, action: PayloadAction<string>) => {
			state.attachments = state.attachments.filter(
				(attachment) => attachment.id !== action.payload
			);
		},
		clearSelectedAttachments: (state) => {
			state.selectedAttachments = initialState.selectedAttachments;
		},
		toggleSelected: (state, action: PayloadAction<string>) => {
			if (state.selectedAttachments.includes(action.payload)) {
				state.selectedAttachments = state.selectedAttachments.filter((id) => id !== action.payload);
			} else {
				state.selectedAttachments.push(action.payload);
			}
		},
		selectAllAttachments: (state) => {
			state.selectedAttachments = state.attachments.map((attachment) => attachment.id);
		},
		setSearchText: (state, action: PayloadAction<string>) => {
			state.uiDetails.searchText = action.payload;
		},
	},
});

export const {
	reset,
	setFile,
	updateAttachment,
	addAttachment,
	findAttachmentById,
	setAttachments,
	clearSelectedAttachment,
	setSelectedAttachment,
	setName,
	setCaption,
	setCustomCaption,
	setFileName,
	startAttachmentSaving,
	startAttachmentDeleting,
	startAttachmentUpdating,
	setError,
	deleteAttachment,
	clearSelectedAttachments,
	toggleSelected,
	selectAllAttachments,
	setSearchText,
	removeFile,
} = AttachmentSlice.actions;

export default AttachmentSlice.reducer;
