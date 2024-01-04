import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { LinkShortenerState } from '../types/LinkShortnerState';

const initialState: LinkShortenerState = {
	create_details: {
		link: '',
		number: '',
		message: '',
	},
	list: [],
	generation_result: {
		generated_link: '',
		generated_image: '',
		error: '',
	},
	ui: {
		loading_links: false,
		generating_link: false,
		shortening_link: false,
		link_copied: false,
	},
};

const LinkShortenerReducer = createSlice({
	name: StoreNames.LINK,
	initialState: initialState,
	reducers: {
		reset: (state) => {
			state.list = initialState.list;
			state.create_details = initialState.create_details;
			state.generation_result = initialState.generation_result;
			state.ui = initialState.ui;
		},
		setLink: (state, action: PayloadAction<typeof initialState.create_details.link>) => {
			state.create_details.link = action.payload;
		},
		setNumber: (state, action: PayloadAction<typeof initialState.create_details.number>) => {
			state.create_details.number = action.payload;
		},
		setMessage: (state, action: PayloadAction<typeof initialState.create_details.message>) => {
			state.create_details.message = action.payload;
		},
		setList: (state, action: PayloadAction<typeof initialState.list>) => {
			state.list = action.payload;
		},
		addShortenLink: (state, action: PayloadAction<(typeof initialState.list)[number]>) => {
			state.create_details = initialState.create_details;
			state.list.push(action.payload);
		},
		setGenerated: (
			state,
			action: PayloadAction<{
				generated_link: typeof initialState.generation_result.generated_link;
				generated_image: typeof initialState.generation_result.generated_image;
			}>
		) => {
			state.generation_result.generated_link = action.payload.generated_link;
			state.generation_result.generated_image = action.payload.generated_image;
		},
		setErrorGeneratingLink: (
			state,
			action: PayloadAction<typeof initialState.generation_result.error>
		) => {
			state.generation_result.error = action.payload;
		},

		setGeneratingLink: (state, action: PayloadAction<typeof initialState.ui.generating_link>) => {
			state.ui.generating_link = action.payload;
		},
		setShortingLink: (state, action: PayloadAction<typeof initialState.ui.shortening_link>) => {
			state.ui.shortening_link = action.payload;
		},
		setLoadingLinks: (state, action: PayloadAction<typeof initialState.ui.loading_links>) => {
			state.ui.loading_links = action.payload;
		},
		setLinkCopied: (state, action: PayloadAction<typeof initialState.ui.link_copied>) => {
			state.ui.link_copied = action.payload;
		},
		deleteShortenLink: (state, action: PayloadAction<string>) => {
			state.list = state.list.filter((link) => link.id !== action.payload);
		},
		updateShortenLink: (
			state,
			action: PayloadAction<{ id: string; data: Omit<(typeof initialState.list)[number], 'id'> }>
		) => {
			state.list = state.list.map((element) =>
				element.id === action.payload.id
					? { ...action.payload.data, id: action.payload.id }
					: element
			);
		},
	},
});

export const {
	reset,
	setLink,
	setMessage,
	setNumber,
	setList,
	addShortenLink,
	setGenerated,
	setGeneratingLink,
	setLinkCopied,
	setShortingLink,
	setErrorGeneratingLink,
	deleteShortenLink,
	updateShortenLink,
	setLoadingLinks,
} = LinkShortenerReducer.actions;

export default LinkShortenerReducer.reducer;
