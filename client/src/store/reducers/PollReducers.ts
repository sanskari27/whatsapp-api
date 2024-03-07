import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { PollState } from '../types/PollState';

const initialState: PollState = {
	list: [],
	polls: [
		{
			title: '',
			options: ['', ''],
			isMultiSelect: false,
		},
	],
	selectedPollDetails: [
		{
			group_name: '',
			isMultiSelect: false,
			options: [''],
			selected_option: [''],
			title: '',
			voted_at: '',
			voter_name: '',
			voter_number: '',
		},
	],
	error: {
		pollIndex: -1,
		message: '',
	},
	ui: { searchText: '' },
};

const PollSlice = createSlice({
	name: StoreNames.POLL,
	initialState,
	reducers: {
		reset: (state) => {
			state.polls = initialState.polls;
			state.error = initialState.error;
			state.list = initialState.list;
			state.ui = initialState.ui;
		},
		setPollList: (state, action: PayloadAction<typeof initialState.list>) => {
			state.list = action.payload;
		},
		setPoll: (state, action: PayloadAction<typeof initialState.polls>) => {
			state.polls = action.payload;
		},
		setTitle: (state, action: PayloadAction<{ title: string; pollIndex: number }>) => {
			state.polls[action.payload.pollIndex].title = action.payload.title;
		},
		setOptions: (
			state,
			action: PayloadAction<{
				option: string;
				pollIndex: number;
				optionIndex: number;
			}>
		) => {
			state.polls[action.payload.pollIndex].options[action.payload.optionIndex] =
				action.payload.option;
		},
		setIsMultiSelect: (
			state,
			action: PayloadAction<{ isMultiSelect: boolean; pollIndex: number }>
		) => {
			state.polls[action.payload.pollIndex].isMultiSelect = action.payload.isMultiSelect;
		},
		addBlankPoll: (state) => {
			state.polls.push({
				title: '',
				options: ['', ''],
				isMultiSelect: false,
			});
		},
		addBlankPollOption: (state, action: PayloadAction<number>) => {
			state.polls[action.payload].options.push('');
		},
		deletePoll: (state, action: PayloadAction<number>) => {
			state.polls.splice(action.payload, 1);
		},
		deletePollOption: (
			state,
			action: PayloadAction<{ pollIndex: number; optionIndex: number }>
		) => {
			state.polls[action.payload.pollIndex].options.splice(action.payload.optionIndex, 1);
		},
		setError: (
			state,
			action: PayloadAction<{
				pollIndex: number;
				message: string;
			}>
		) => {
			state.error.pollIndex = action.payload.pollIndex;
			state.error.message = action.payload.message;
		},
		setSelectedPollDetails: (
			state,
			action: PayloadAction<typeof initialState.selectedPollDetails>
		) => {
			state.selectedPollDetails = action.payload;
		},
		setPollAt: (
			state,
			action: PayloadAction<{
				pollIndex: number;
				poll: {
					title: string;
					options: string[];
					isMultiSelect: boolean;
				};
			}>
		) => {
			state.polls[action.payload.pollIndex] = action.payload.poll;
		},
		setSearchText: (state, action: PayloadAction<typeof initialState.ui.searchText>) => {
			state.ui.searchText = action.payload;
		},
	},
});

export const {
	reset,
	setPoll,
	setPollList,
	setTitle,
	setOptions,
	setIsMultiSelect,
	addBlankPoll,
	addBlankPollOption,
	deletePoll,
	deletePollOption,
	setError,
	setSelectedPollDetails,
	setPollAt,
	setSearchText
} = PollSlice.actions;
export default PollSlice.reducer;
