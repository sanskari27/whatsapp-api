import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '../config';
import { ScheduledCampaign, SchedulerState } from '../types/SchedulerState';

const initialState: SchedulerState = {
	all_campaigns: [] as ScheduledCampaign[],
	details: {
		type: 'CSV',
		numbers: [],
		csv_file: '',
		group_ids: [],
		label_ids: [],
		message: '',
		variables: [],
		shared_contact_cards: [],
		attachments: [],
		campaign_name: '',
		min_delay: 1,
		max_delay: 60,
		startTime: '00:00',
		endTime: '23:59',
		batch_delay: 120,
		batch_size: 1,
	},
	isRecipientsLoading: false,
	isBusinessAccount: false,
	recipients: [],
};

const SchedulerSlice = createSlice({
	name: StoreNames.SCHEDULER,
	initialState,
	reducers: {
		reset: (state) => {
			state.all_campaigns = initialState.all_campaigns;
			state.details = initialState.details;
			state.isRecipientsLoading = initialState.isRecipientsLoading;
			state.isBusinessAccount = initialState.isBusinessAccount;
			state.recipients = initialState.recipients;
		},
		setRecipientsFrom: (state, action: PayloadAction<typeof initialState.details.type>) => {
			state.details.type = action.payload;
		},
		setRecipientsLoading: (
			state,
			action: PayloadAction<typeof initialState.isRecipientsLoading>
		) => {
			state.isRecipientsLoading = action.payload;
		},
		setBusinessAccount: (state, action: PayloadAction<typeof initialState.isBusinessAccount>) => {
			state.isBusinessAccount = action.payload;
		},
		setRecipients: (state, action: PayloadAction<typeof initialState.recipients>) => {
			state.recipients = action.payload;
		},
	},
});

export const { reset, setRecipientsFrom, setRecipientsLoading, setBusinessAccount, setRecipients } =
	SchedulerSlice.actions;

export default SchedulerSlice.reducer;
