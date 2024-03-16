import axios from 'axios';
import APIInstance from '../config/APIInstance';
import { SERVER_URL } from '../config/const';
import { Profile } from '../store/types/UserDetails';

export default class AuthService {
	static async isAuthenticated() {
		try {
			await axios.get(SERVER_URL + 'auth/account/validate', {
				headers: {
					'Cache-Control': 'no-cache',
					Pragma: 'no-cache',
					Expires: '0',
				},
				withCredentials: true,
			});
			return true;
		} catch (err) {
			return false;
		}
	}

	static async profiles() {
		try {
			const { data } = await APIInstance.get('/auth/account/profiles');
			return {
				profiles: data.profiles as Profile[],
				max_profiles: data.max_profiles as number,
				isSubscribed: data.isSubscribed as boolean,
				username: data.username as string,
			};
		} catch (err) {
			return {
				profiles: [],
				max_profiles: 0,
				isSubscribed: false,
				username: '',
			};
		}
	}

	static async login(username: string, password: string) {
		try {
			await APIInstance.post(`/auth/account/login`, {
				username,
				password,
				access_level: 'USER',
			});
			return true;
		} catch (err) {
			return false;
		}
	}

	static async isUsernameAvailable(username: string) {
		try {
			await APIInstance.post(`/auth/account/is-username-available`, { username });
			return true;
		} catch (err) {
			return false;
		}
	}

	static async create(data: {
		username: string;
		password: string;
		name: string;
		phone: string;
	}): Promise<[boolean, string]> {
		try {
			await APIInstance.post(`/auth/account/create-account`, data);
			return [true, ''];
		} catch (err) {
			let str = 'Internal Server Error.';
			if (axios.isAxiosError(err)) {
				if (err.response?.data.title === 'USERNAME_ALREADY_EXISTS') {
					str = 'Username already exists.';
				} else if (err.response?.data.title === 'PHONE_ALREADY_EXISTS') {
					str = 'Phone number associated with another username.';
				}
			}

			return [false, str];
		}
	}

	static async logout() {
		try {
			await APIInstance.post(`/auth/account/logout`);
			return true;
		} catch (err) {
			return false;
		}
	}

	static async addDevice() {
		try {
			const { data } = await APIInstance.post(`/auth/account/add-device`);
			return data.client_id;
		} catch (err) {
			return null;
		}
	}

	static async removeDevice(client_id: string) {
		try {
			await APIInstance.post(`/auth/account/remove-device`, {
				client_id,
			});
			return true;
		} catch (err) {
			return false;
		}
	}
}
