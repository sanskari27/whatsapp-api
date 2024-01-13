export type BotState = {
	all_bots: Bot[];
	details: Bot;
	ui: {
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
	respond_to: string;
	trigger: string;
	trigger_gap_seconds: number;
	response_delay_seconds: number;
	options: string;
	message: string;
	attachments: string[];
	shared_contact_cards: string[];
	isActive: boolean;
};
