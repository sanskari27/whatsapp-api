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
	static async getUserDetails() {
		try {
			const { data } = await APIInstance.get(`/auth/details`);
			return {
				name: data.name,
				phoneNumber: data.phoneNumber,
				isSubscribed: data.isSubscribed,
				subscriptionExpiration: data.subscriptionExpiration,
				userType: data.userType as 'BUSINESS' | 'PERSONAL',
				paymentRecords: data.paymentRecords,
			};
		} catch (err) {
			return {
				name: '',
				phoneNumber: '',
				isSubscribed: false,
				subscriptionExpiration: '',
				userType: '',
				paymentRecords: [],
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
