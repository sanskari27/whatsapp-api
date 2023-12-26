import { createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { LinkShortenerState } from '../types/LinkShortnerState';

const initState: LinkShortenerState = {
    link: '',
    number: '',
    message: '',
    list: [],
};

const LinkShortenerReducer = createSlice({
    name: StoreNames.LINK,
    initialState: initState,
    reducers: {
        reset: (state) => {
            state.link = initState.link;
            state.number = initState.number;
            state.message = initState.message;
        },
        setLink: (state, action) => {
            state.link = action.payload;
        },
        setNumber: (state, action) => {
            state.number = action.payload;
        },
        setMessage: (state, action) => {
            state.message = action.payload;
        },
        setList: (state, action) => {
            state.list = action.payload;
        },
    },
});

export const { reset, setLink, setMessage, setNumber, setList } =
    LinkShortenerReducer.actions;

export default LinkShortenerReducer.reducer;
