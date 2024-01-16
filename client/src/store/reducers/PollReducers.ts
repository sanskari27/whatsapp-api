import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { PollState } from '../types/PollState';

const initialState: PollState = {
    polls: [
        {
            title: '',
            options: ['', ''],
            isMultiSelect: false,
        },
    ],
    error: {
        pollIndex: -1,
        message: '',
    },
};

const PollSlice = createSlice({
    name: StoreNames.POLL,
    initialState,
    reducers: {
        reset: (state) => {
            state.polls = initialState.polls;
            state.error = initialState.error;
        },
        setPoll: (state, action: PayloadAction<typeof initialState.polls>) => {
            state.polls = action.payload;
        },
        setTitle: (
            state,
            action: PayloadAction<{ title: string; pollIndex: number }>
        ) => {
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
            state.polls[action.payload.pollIndex].options[
                action.payload.optionIndex
            ] = action.payload.option;
        },
        setIsMultiSelect: (
            state,
            action: PayloadAction<{ isMultiSelect: boolean; pollIndex: number }>
        ) => {
            state.polls[action.payload.pollIndex].isMultiSelect =
                action.payload.isMultiSelect;
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
            state.polls[action.payload.pollIndex].options.splice(
                action.payload.optionIndex,
                1
            );
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
    },
});

export const {
    reset,
    setPoll,
    setTitle,
    setOptions,
    setIsMultiSelect,
    addBlankPoll,
    addBlankPollOption,
    deletePoll,
    deletePollOption,
    setError,
} = PollSlice.actions;
export default PollSlice.reducer;
