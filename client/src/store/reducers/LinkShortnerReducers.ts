import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { LinkShortenerState } from '../types/LinkShortnerState';

const initialState: LinkShortenerState = {
	link: '',
	number: '',
	message: '',
	list: [],
	generatedLink: '',
	generatedImage: '',

	generatingLink: false,
	linkCopied: false,
	shorteningLink: false,
};

const LinkShortenerReducer = createSlice({
	name: StoreNames.LINK,
	initialState: initialState,
	reducers: {
		reset: (state) => {
			state.link = initialState.link;
			state.number = initialState.number;
			state.message = initialState.message;
			state.list = initialState.list;
		},
		setLink: (state, action: PayloadAction<typeof initialState.link>) => {
			state.link = action.payload;
		},
		setNumber: (state, action: PayloadAction<typeof initialState.number>) => {
			state.number = action.payload;
		},
		setMessage: (state, action: PayloadAction<typeof initialState.message>) => {
			state.message = action.payload;
		},
		setList: (state, action: PayloadAction<typeof initialState.list>) => {
			state.list = action.payload;
		},
		addShortenLink: (state, action: PayloadAction<(typeof initialState.list)[number]>) => {
			state.link = initialState.link;
			state.number = initialState.number;
			state.message = initialState.message;
			state.list.push(action.payload);
		},
		setGenerated: (
			state,
			action: PayloadAction<{
				generatedLink: typeof initialState.generatedLink;
				generatedImage: typeof initialState.generatedImage;
			}>
		) => {
			state.generatedLink = action.payload.generatedLink;
			state.generatedImage = action.payload.generatedImage;
		},

		setGeneratingLink: (state, action: PayloadAction<typeof initialState.generatingLink>) => {
			state.generatingLink = action.payload;
		},
		setShortingLink: (state, action: PayloadAction<typeof initialState.shorteningLink>) => {
			state.shorteningLink = action.payload;
		},
		setLinkCopied: (state, action: PayloadAction<typeof initialState.linkCopied>) => {
			state.linkCopied = action.payload;
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
} = LinkShortenerReducer.actions;

export default LinkShortenerReducer.reducer;
