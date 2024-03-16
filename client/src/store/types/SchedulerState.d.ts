export type SchedulerState = {
	details: SchedulerDetails;
	all_campaigns: Campaign[];
	all_schedulers: Scheduler[];
	recipients: {
		fileName?: string;
		name: string;
		headers?: string[];
		id: string;
	}[];
	isRecipientsLoading: boolean;
	ui: {
		condition: 'ALL' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
		searchText: string;
		filterDateStart: Date;
		filterDateEnd: Date;
		campaignLoading: boolean;
		messageError: boolean;
		campaignNameError: boolean;
		recipientsError: boolean;
		apiError: string;
		editingMessage: boolean;
		minDelayError: boolean;
		maxDelayError: boolean;
		batchSizeError: boolean;
		batchDelayError: boolean;
	};
};

export type Campaign = {
	devices: string[];
	campaign_id: string;
	name: string;
	sent: number;
	failed: number;
	pending: number;
	isPaused: boolean;
	createdAt: string;
	description: string;
};
export type Scheduler = {
	devices: string[];
	id: string;
	name: string;
	description: string;
	endAt: string;
	startAt: string;
	isActive: boolean;
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];
	attachments: string[];
	contacts: string[];
	message: string;
	csv: string;
};

export type SchedulerDetails = {
	message_scheduler_id: string;
	type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
	devices: string[];
	numbers?: string[];
	csv: string;
	group_ids: string[];
	label_ids: string[];
	message: string;
	variables: string[];
	contacts: string[];
	attachments: string[];
	name: string;
	min_delay: number;
	max_delay: number;
	startDate: string;
	startTime: string;
	endTime: string;
	batch_delay: number;
	batch_size: number;
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];
	description: string;
};

export default UserState;
