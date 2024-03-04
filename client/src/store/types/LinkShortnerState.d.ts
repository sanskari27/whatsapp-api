export type LinkShortenerState = {
	create_details: {
		id: string;
		link: string;
		number: string;
		message: string;
		title: string;
	};
	list: ShortLink[];
	generation_result: {
		generated_link: string;
		generated_image: string;
		error: string;
	};
	ui: {
		searchText: string;
		loading_links: boolean;
		generating_link: boolean;
		shortening_link: boolean;
		link_copied: boolean;
	};
};

export type ShortLink = {
	id: string;
	shorten_link: string;
	link: string;
	base64: string;
	title: string;
};
