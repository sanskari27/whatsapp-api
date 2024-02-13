import APIInstance from '../config/APIInstance';

export default class TokenService {
	static async getToken() {
		try {
			const { data } = await APIInstance.get(`/token`);
			return data.token as string;
		} catch (err) {
			return '';
		}
	}

	static async setToken(token: string) {
		try {
			await APIInstance.post(`/token`, {
				token: token.toUpperCase(),
			});
			return true;
		} catch (err) {
			return false;
		}
	}

	static async getPromotionalMessage() {
		try {
			const { data } = await APIInstance.get(`/token/promotional`);
			return {
				message_1: data.message_1 as string,
				message_2: data.message_2 as string,
			};
		} catch (err) {
			return {
				message_1: '',
				message_2: '',
			};
		}
	}

	static async setPromotionalMessage({
		message_1,
		message_2,
	}: {
		message_1: string;
		message_2: string;
	}) {
		try {
			await APIInstance.post(`/token/promotional`, {
				message_1,
				message_2,
			});
			return true;
		} catch (err) {
			return false;
		}
	}
}
