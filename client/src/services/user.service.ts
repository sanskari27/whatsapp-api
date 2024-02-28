import axios from 'axios';
import APIInstance from '../config/APIInstance';
import { SERVER_URL } from '../config/const';
import { getClientID } from '../utils/ChromeUtils';

export default class UserService {
	static async isAuthenticated() {
		try {
			const { data } = await axios.get(SERVER_URL + 'auth/validate', {
				headers: {
					'client-id': getClientID(),
					'Cache-Control': 'no-cache',
					Pragma: 'no-cache',
					Expires: '0',
				},
			});
			return {
				session_active: true,
				whatsapp_ready: data.isWhatsappReady,
			};
		} catch (err) {
			return {
				session_active: false,
				whatsapp_ready: false,
			};
		}
	}
	static async getUserDetails() {
		const { data } = await APIInstance.get(`/auth/details`);
		return {
			name: data.name as string,
			phoneNumber: data.phoneNumber as string,
			isSubscribed: data.isSubscribed as boolean,
			canSendMessage: data.canSendMessage as boolean,
			subscriptionExpiration: data.subscriptionExpiration as string,
			userType: data.userType as 'BUSINESS' | 'PERSONAL',
		};
	}

	static async logout() {
		try {
			await APIInstance.post(`/auth/logout`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
