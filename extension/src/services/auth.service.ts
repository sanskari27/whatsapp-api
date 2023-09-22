import APIInstance from '../config/APIInstance';

export default class AuthService {
	static async isAuthenticated() {
		try {
			await APIInstance.get(`/auth/validate`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
