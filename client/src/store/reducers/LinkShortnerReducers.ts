import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { LinkShortenerState } from '../types/LinkShortnerState';

const initialState: LinkShortenerState = {
	create_details: {
		id: '',
		title: '',
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
		searchText: '',
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
			state.create_details = initialState.create_details;
			state.generation_result = initialState.generation_result;
			state.ui = initialState.ui;
		},
		setLink: (state, action: PayloadAction<typeof initialState.create_details.link>) => {
			state.create_details.link = action.payload;
			state.create_details.number = '';
			state.create_details.message = '';
			state.generation_result.error = '';
		},
		setTitle: (state, action: PayloadAction<typeof initialState.create_details.title>) => {
			state.create_details.title = action.payload;
			state.generation_result.error = '';
		},
		setNumber: (state, action: PayloadAction<typeof initialState.create_details.number>) => {
			if (isNaN(Number(action.payload))) {
				return;
			}
			state.create_details.number = action.payload;
			state.create_details.link = '';
			state.generation_result.error = '';
		},
		setMessage: (state, action: PayloadAction<typeof initialState.create_details.message>) => {
			state.create_details.message = action.payload;
			state.create_details.link = '';
			state.generation_result.error = '';
		},
		setLinksList: (state, action: PayloadAction<typeof initialState.list>) => {
			state.list = action.payload;
		},
		addShortenLink: (state, action: PayloadAction<(typeof initialState.list)[number]>) => {
			state.create_details = initialState.create_details;
			state.list.push(action.payload);
		},
		removeShortenLink: (state, action: PayloadAction<string>) => {
			state.create_details = initialState.create_details;
			state.list = state.list.filter((item) => item.id !== action.payload);
		},
		setErrorGeneratingLink: (
			state,
			action: PayloadAction<typeof initialState.generation_result.error>
		) => {
			state.generation_result.error = action.payload;
		},

		findLinkByID: (state, action: PayloadAction<string>) => {
			const link = state.list.find((e) => e.id === action.payload);
			if (!link) {
				return;
			}
			const { link: main_link, title, id } = link;

			if (main_link.includes('wa.me')) {
				state.create_details.number = main_link.split('wa.me/')[1].split('?')[0];
				state.create_details.message = decodeURIComponent(main_link.split('text=')[1]);
				state.create_details.title = title;
				state.create_details.id = id;
			} else {
				state.create_details.link = main_link;
				state.create_details.title = title;
				state.create_details.id = id;
			}
		},
		updateShortenLink: (
			state,
			action: PayloadAction<{
				id: string;
				data: Omit<(typeof initialState.list)[number], 'id'>;
			}>
		) => {
			state.list = state.list.map((element) =>
				element.id === action.payload.id
					? { ...action.payload.data, id: action.payload.id }
					: element
			);
		},
		setGeneratingLink: (state, action: PayloadAction<boolean>) => {
			state.ui.generating_link = action.payload;
		},
		setSearchText: (state, action: PayloadAction<string>) => {
			state.ui.searchText = action.payload;
		},
	},
});

export const {
	reset,
	setLink,
	setMessage,
	setNumber,
	setLinksList,
	addShortenLink,
	setTitle,
	setErrorGeneratingLink,
	updateShortenLink,
	setSearchText,
	findLinkByID,
	setGeneratingLink,
	removeShortenLink,
} = LinkShortenerReducer.actions;

export default LinkShortenerReducer.reducer;
