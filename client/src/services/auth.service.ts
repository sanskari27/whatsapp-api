import axios from 'axios';
import APIInstance from '../config/APIInstance';
import { SERVER_URL } from '../config/const';
import { getClientID } from '../utils/ChromeUtils';

export default class AuthService {
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
		try {
			const { data } = await APIInstance.get(`/auth/details`);
			return {
				name: data.name,
				phoneNumber: data.phoneNumber,
				isSubscribed: data.isSubscribed,
				canSendMessage: data.canSendMessage,
				subscriptionExpiration: data.subscriptionExpiration,
				userType: data.userType as 'BUSINESS' | 'PERSONAL',
				paymentRecords: data.paymentRecords,
			};
		} catch (err) {
			return {
				name: '',
				phoneNumber: '',
				isSubscribed: false,
				canSendMessage: false,
				subscriptionExpiration: '',
				userType: 'PERSONAL' as 'BUSINESS' | 'PERSONAL',
				paymentRecords: {},
			};
		}
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
