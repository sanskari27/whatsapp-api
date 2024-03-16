import { Poll } from './PollState';

export type BotState = {
	all_bots: Bot[];
	details: Bot;
	ui: {
		searchText: string;
		condition: 'ALL' | 'RUNNING' | 'PAUSED';
		isAddingBot: boolean;
		isEditingBot: boolean;
		triggerError: string;
		messageError: string;
		respondToError: string;
		optionsError: string;
		contactCardsError: string;
		attachmentError: string;
		triggerGapError: string;
		responseGapError: string;
	};
	trigger_gap: {
		time: number;
		type: string;
	};
	response_delay: {
		time: number;
		type: string;
	};
};

export type Bot = {
	bot_id: string;
	devices: string[];
	respond_to: string;
	trigger: string;
	trigger_gap_seconds: number;
	response_delay_seconds: number;
	options: string;
	startAt: string;
	endAt: string;
	message: string;
	attachments: string[];
	contacts: string[];
	isActive: boolean;
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];
	forward: {
		number: string;
		message: string;
	};
	nurturing: {
		message: string;
		after: number;
		startAt: string;
		endAt: string;
		contacts: string[];
		attachments: string[];
		polls: Poll[];
	}[];
};
