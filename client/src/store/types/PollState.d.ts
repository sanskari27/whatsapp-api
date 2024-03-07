export type PollState = {
	list: (Poll & { vote_count: number })[];
	polls: Poll[];
	error: { pollIndex: number; message: string };
	selectedPollDetails: {
		group_name: string;
		isMultiSelect: boolean;
		options: string[];
		selected_option: string[];
		title: string;
		voted_at: string;
		voter_name: string;
		voter_number: string;
	}[];
	ui: {
		searchText: string;
	};
};

type Poll = {
	title: string;
	options: string[];
	isMultiSelect: boolean;
};
