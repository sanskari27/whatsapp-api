export type SchedulerState = {
	details: SchedulerDetails;
	all_campaigns: ScheduledCampaign[];
	all_schedulers: {
		id: string;
		end_at: string;
		start_from: string;
		isActive: boolean;
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
		attachments: string[];
		shared_contact_cards: string[];
		message: string;
	}[];
	recipients: {
		id: string;
		name: string;
		headers?: string[];
		_id?: string;
	}[];
	isRecipientsLoading: boolean;
	isBusinessAccount: boolean;
	ui: {
		campaignLoading: boolean;
		exportingCampaign: boolean;
		deletingCampaign: boolean;
	};
};

export type ScheduledCampaign = {
	campaign_id: string;
	campaignName: string;
	sent: number;
	failed: number;
	pending: number;
	isPaused: boolean;
	createdAt: string;
};

export type SchedulerDetails = {
	type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
	numbers?: string[];
	csv_file: string;
	group_ids: string[];
	label_ids: string[];
	message: string;
	variables: string[];
	shared_contact_cards: string[];
	attachments: string[];
	campaign_name: string;
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
};

export default UserState;
