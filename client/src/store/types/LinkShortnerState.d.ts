export type LinkShortenerState = {
	create_details: {
		link: string;
		number: string;
		message: string;
	};
	list: ShortLink[];
	generation_result: {
		generated_link: string;
		generated_image: string;
		error: string;
	};
	ui: {
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
};
