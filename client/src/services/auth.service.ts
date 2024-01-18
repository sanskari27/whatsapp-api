import axios from 'axios';
import APIInstance from '../config/APIInstance';
import { SERVER_URL } from '../config/const';
import { getClientID } from '../utils/ChromeUtils';

export default class AuthService {
	static async isAuthenticated() {
		try {
			await axios.get(SERVER_URL + '/auth/validate', {
				headers: {
					'client-id': getClientID(),
				},
			});
			return true;
		} catch (err) {
			return false;
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
