import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '..';
import { ChatBotState } from '../types/ChatBotState';

const initialState: ChatBotState = {
	all_chatbos: [],
	attachments: [],
	message: '',
	options: 'INCLUDES_IGNORE_CASE',
	respond_to: 'ALL',
	shared_contact_cards: [],
	trigger: '',
	message_delay: '',
};

const ChatBotSlice = createSlice({
	name: StoreNames.CHATBOT,
	initialState,
	reducers: {
		reset: (state) => {
			state.all_chatbos = initialState.all_chatbos;
			state.attachments = initialState.attachments;
			state.message = initialState.message;
			state.options = initialState.options;
			state.respond_to = initialState.respond_to;
			state.shared_contact_cards = initialState.shared_contact_cards;
			state.trigger = initialState.trigger;
		},
		setChatBots: (state, action: PayloadAction<typeof initialState.all_chatbos>) => {
			state.all_chatbos = action.payload;
		},
		setTrigger: (state, action: PayloadAction<typeof initialState.trigger>) => {
			state.trigger = action.payload;
		},
		setMessage: (state, action: PayloadAction<typeof initialState.message>) => {
			state.message = action.payload;
		},
		setRespondTo: (state, action: PayloadAction<typeof initialState.respond_to>) => {
			state.respond_to = action.payload;
		},
		setOptions: (state, action: PayloadAction<typeof initialState.options>) => {
			state.options = action.payload;
		},
		setAttachments: (state, action: PayloadAction<typeof initialState.attachments>) => {
			state.attachments = action.payload;
		},
		setContactCards: (state, action: PayloadAction<typeof initialState.shared_contact_cards>) => {
			state.shared_contact_cards = action.payload;
		},
		setResponseDelay: (state, action: PayloadAction<typeof initialState.message_delay>) => {
			state.message_delay = action.payload ?? 0;
		},
	},
});

export const {
	reset,
	setChatBots,
	setTrigger,
	setMessage,
	setRespondTo,
	setOptions,
	setAttachments,
	setContactCards,
	setResponseDelay,
} = ChatBotSlice.actions;

export default ChatBotSlice.reducer;
