import APIInstance from '../config/APIInstance';
import { User } from '../store/types/UsersState';

export default class UsersService {
	static async getUsers(): Promise<User[]> {
		try {
			const { data } = await APIInstance.get(`/users`);
			return data.users.map((user: User) => ({
				id: (user.id as string) ?? '',
				name: (user.name as string) ?? '',
				phone: (user.phone as string) ?? '',
				type: (user.type as string) ?? 'PERSONAL',
				subscription_expiry: (user.subscription_expiry as string) ?? '',
			}));
		} catch (err) {
			return [];
		}
	}

	static async extendExpiry(user_id: string, date: string) {
		try {
			await APIInstance.post(`/users/${user_id}/extend-expiry`, {
				date: date,
			});
		} catch (err) {
			//ignore
		}
	}

	static async sendPaymentReminder(user_id: string, message: string) {
		try {
			await APIInstance.post(`/users/${user_id}/send-payment-reminder`, {
				message,
			});
		} catch (err) {
			//ignore
		}
	}

	static async logoutUser(user_id: string) {
		try {
			await APIInstance.post(`/users/${user_id}/logout`);
		} catch (err) {
			//ignore
		}
	}
}
