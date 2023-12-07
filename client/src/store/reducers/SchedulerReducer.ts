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
};

const AthleteSlice = createSlice({
	name: StoreNames.ATHLETE,
	initialState,
	reducers: {
		reset: (state) => {
			state.all_campaigns = initialState.all_campaigns;
			state.details = initialState.details;
		},
		setRecipientsFrom: (state, action: PayloadAction<typeof initialState.details.type>) => {
			state.details.type = action.payload;
		},
	},
});

export const { reset, setRecipientsFrom } = AthleteSlice.actions;

export default AthleteSlice.reducer;
