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
}
