import APIInstance from '../config/APIInstance';

export default class ShortenerService {
	static async getShortenedURL(number: string, message: string, title: string) {
		try {
			const { data } = await APIInstance.post(`/shortner/create-whatsapp-link`, {
				number,
				message,
				title,
			});
			return {
				shorten_link: data.shorten_link as string,
				link: data.link as string,
				base64: data.base64 as string,
				id: data.id as string,
				title: data.title as string,
			};
		} catch (err) {
			return null;
		}
	}

	static async createLink(link: string) {
		try {
			const { data } = await APIInstance.post(`/shortner/create-link`, {
				link,
			});
			return {
				shorten_link: data.shorten_link as string,
				link: data.link as string,
				base64: data.base64 as string,
				id: data.id as string,
				title: data.title as string,
			};
		} catch (err) {
			return null;
		}
	}

	static async listAll() {
		try {
			const { data } = await APIInstance.get(`/shortner`);
			return data.links as {
				shorten_link: string;
				link: string;
				base64: string;
				id: string;
				title: string;
			}[];
		} catch (err) {
			return [] as {
				shorten_link: string;
				link: string;
				base64: string;
				id: string;
				title: string;
			}[];
		}
	}

	static async deleteLink(shorten_link_id: string) {
		try {
			const { data } = await APIInstance.delete(`/shortner/${shorten_link_id}`);
			return data as {
				shorten_link: string;
				link: string;
				base64: string;
			};
		} catch (err) {
			return {
				shorten_link: '',
				link: '',
				base64: '',
			};
		}
	}

	static async updateLink(shorten_link_id: string, link: string, title: string) {
		try {
			const { data } = await APIInstance.patch(`/shortner/${shorten_link_id}`, { link, title });
			return data as {
				shorten_link: string;
				link: string;
				base64: string;
				title: string;
			};
		} catch (err) {
			return null;
		}
	}
}
