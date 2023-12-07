import APIInstance from '../config/APIInstance';

export default class TokenService {
	static async validateToken(token: string) {
		try {
			await APIInstance.get(`/token/validate/${token}`);
			return true;
		} catch (err) {
			console.log(err);

			return false;
		}
	}
}
