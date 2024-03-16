import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreNames } from '../config';
import { Campaign, SchedulerState } from '../types/SchedulerState';

const initialState: SchedulerState = {
	all_campaigns: [] as Campaign[],
	all_schedulers: [],
	details: {
		message_scheduler_id: '',
		type: 'NUMBERS',
		devices: [],
		numbers: [],
		csv: '',
		group_ids: [],
		label_ids: [],
		message: '',
		variables: [],
		contacts: [],
		attachments: [],
		name: '',
		min_delay: 1,
		max_delay: 60,
		startTime: '10:00',
		endTime: '18:00',
		batch_delay: 120,
		batch_size: 1,
		polls: [],
		startDate: new Date().toISOString().slice(0, 10),
		description: '',
	},
	isRecipientsLoading: false,
	recipients: [],
	ui: {
		searchText: '',
		condition: 'ALL',
		filterDateStart: new Date('01/01/2023'),
		filterDateEnd: new Date(),

		campaignLoading: false,
		messageError: false,
		campaignNameError: false,
		recipientsError: false,
		apiError: '',
		editingMessage: false,
		minDelayError: false,
		maxDelayError: false,
		batchSizeError: false,
		batchDelayError: false,
	},
};

const SchedulerSlice = createSlice({
	name: StoreNames.SCHEDULER,
	initialState,
	reducers: {
		reset: (state) => {
			state.details = initialState.details;
			state.isRecipientsLoading = initialState.isRecipientsLoading;
			state.recipients = initialState.recipients;
			state.ui = initialState.ui;
		},
		setAllCampaigns: (state, action: PayloadAction<typeof initialState.all_campaigns>) => {
			state.all_campaigns = action.payload;
		},
		editSelectedScheduler: (
			state,
			action: PayloadAction<(typeof initialState.all_schedulers)[0]>
		) => {
			state.all_schedulers = state.all_schedulers.map((scheduler) => {
				if (scheduler.id === action.payload.id) {
					return action.payload;
				}
				return scheduler;
			});
			state.ui.editingMessage = false;
		},
		setAllSchedulers: (state, action: PayloadAction<typeof initialState.all_schedulers>) => {
			state.all_schedulers = action.payload;
		},
		addScheduler: (state, action: PayloadAction<(typeof initialState.all_schedulers)[0]>) => {
			state.all_schedulers.push(action.payload);
			state.details = initialState.details;
		},
		deleteScheduler: (state, action: PayloadAction<string>) => {
			state.all_schedulers = state.all_schedulers.filter(
				(scheduler) => scheduler.id !== action.payload
			);
		},
		setSelectedScheduler: (state, action: PayloadAction<string>) => {
			const scheduler = state.all_schedulers.find((s) => s.id === action.payload);
			if (!scheduler) return;
			state.details.message_scheduler_id = scheduler.id;
			state.details.devices = scheduler.devices;
			state.details.message = scheduler.message;
			state.details.name = scheduler.name;
			state.details.contacts = scheduler.contacts;
			state.details.attachments = scheduler.attachments;
			state.details.polls = scheduler.polls;
			state.details.startTime = scheduler.startAt;
			state.details.endTime = scheduler.endAt;
			state.details.csv = scheduler.csv;
			state.details.type = 'CSV';
			state.ui.editingMessage = true;
		},
		setCampaignName: (state, action: PayloadAction<typeof initialState.details.name>) => {
			state.details.name = action.payload;
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
		setRecipients: (state, action: PayloadAction<typeof initialState.recipients>) => {
			state.recipients = action.payload;
		},
		setNumbers: (state, action: PayloadAction<typeof initialState.details.numbers>) => {
			state.details.numbers = action.payload;
		},
		setCSVFile: (state, action: PayloadAction<typeof initialState.details.csv>) => {
			state.details.csv = action.payload;
		},
		setVariables: (state, action: PayloadAction<typeof initialState.details.variables>) => {
			state.details.variables = action.payload;
		},
		setGroupRecipients: (state, action: PayloadAction<typeof initialState.details.group_ids>) => {
			state.details.group_ids = action.payload;
		},
		setLabelRecipients: (state, action: PayloadAction<typeof initialState.details.label_ids>) => {
			state.details.label_ids = action.payload;
		},
		setMessage: (state, action: PayloadAction<typeof initialState.details.message>) => {
			state.details.message = action.payload;
		},
		setAttachments: (state, action: PayloadAction<typeof initialState.details.attachments>) => {
			state.details.attachments = action.payload;
		},
		setContactCards: (state, action: PayloadAction<typeof initialState.details.contacts>) => {
			state.details.contacts = action.payload;
		},
		setMinDelay: (state, action: PayloadAction<typeof initialState.details.min_delay>) => {
			state.details.min_delay = action.payload;
		},
		setMaxDelay: (state, action: PayloadAction<typeof initialState.details.max_delay>) => {
			state.details.max_delay = action.payload;
		},
		setBatchSize: (state, action: PayloadAction<typeof initialState.details.batch_size>) => {
			state.details.batch_size = action.payload;
		},
		setBatchDelay: (state, action: PayloadAction<typeof initialState.details.batch_delay>) => {
			state.details.batch_delay = action.payload;
		},
		setStateDate: (state, action: PayloadAction<typeof initialState.details.startDate>) => {
			state.details.startDate = action.payload;
		},
		setStartTime: (state, action: PayloadAction<typeof initialState.details.startTime>) => {
			state.details.startTime = action.payload;
		},
		setEndTime: (state, action: PayloadAction<typeof initialState.details.endTime>) => {
			state.details.endTime = action.payload;
		},
		setPolls: (state, action: PayloadAction<typeof initialState.details.polls>) => {
			state.details.polls = action.payload;
		},
		setDescription: (state, action: PayloadAction<typeof initialState.details.description>) => {
			state.details.description = action.payload;
		},
		setCampaignLoading: (state, action: PayloadAction<boolean>) => {
			state.ui.campaignLoading = action.payload;
		},
		setMessageError: (state, action: PayloadAction<boolean>) => {
			state.ui.messageError = action.payload;
		},
		setCampaignNameError: (state, action: PayloadAction<boolean>) => {
			state.ui.campaignNameError = action.payload;
		},
		setRecipientsError: (state, action: PayloadAction<boolean>) => {
			state.ui.recipientsError = action.payload;
		},
		setMinDelayError: (state, action: PayloadAction<boolean>) => {
			state.ui.minDelayError = action.payload;
		},
		setBatchSizeError: (state, action: PayloadAction<boolean>) => {
			state.ui.batchSizeError = action.payload;
		},
		setMaxDelayError: (state, action: PayloadAction<boolean>) => {
			state.ui.maxDelayError = action.payload;
		},
		setBatchDelayError: (state, action: PayloadAction<boolean>) => {
			state.ui.batchDelayError = action.payload;
		},
		setAPIError: (state, action: PayloadAction<string>) => {
			state.ui.apiError = action.payload;
		},
		addDevice: (state, action: PayloadAction<string>) => {
			state.details.devices.push(action.payload);
		},
		removeDevice: (state, action: PayloadAction<string>) => {
			state.details.devices = state.details.devices.filter((f) => f !== action.payload);
		},
		setSearchText: (state, action: PayloadAction<string>) => {
			state.ui.searchText = action.payload;
		},
		setCondition: (state, action: PayloadAction<typeof initialState.ui.condition>) => {
			state.ui.condition = action.payload;
		},
		setFilterDateStart: (state, action: PayloadAction<typeof initialState.ui.filterDateStart>) => {
			state.ui.filterDateStart = action.payload;
		},
		setFilterDateEnd: (state, action: PayloadAction<typeof initialState.ui.filterDateEnd>) => {
			state.ui.filterDateEnd = action.payload;
		},
	},
});

export const {
	reset,
	setAllCampaigns,
	editSelectedScheduler,
	addScheduler,
	deleteScheduler,
	setAllSchedulers,
	setSelectedScheduler,
	setCampaignName,
	setRecipientsFrom,
	setRecipients,
	setCSVFile,
	setVariables,
	setGroupRecipients,
	setLabelRecipients,
	setMessage,
	setAttachments,
	setContactCards,
	setMinDelay,
	setMaxDelay,
	setBatchSize,
	setBatchDelay,
	setStateDate,
	setStartTime,
	setEndTime,
	setPolls,
	setDescription,
	setCampaignLoading,
	setNumbers,
	setMessageError,
	setCampaignNameError,
	setRecipientsError,
	setRecipientsLoading,
	setMinDelayError,
	setAPIError,
	setBatchDelayError,
	setMaxDelayError,
	setBatchSizeError,
	setSearchText,
	setCondition,
	setFilterDateEnd,
	setFilterDateStart,
	addDevice,
	removeDevice,
} = SchedulerSlice.actions;

export default SchedulerSlice.reducer;
