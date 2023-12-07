import APIInstance from '../config/APIInstance';

export default class PaymentService {
	static async paymentRecords() {
		try {
			const { data: response } = await APIInstance.get('/payment');

			return response.payments as (
				| {
						type: 'payment';
						id: string;
						date: string;
						amount: number;
				  }
				| {
						type: 'subscription';
						id: string;
						plan: string;
						isActive: boolean;
						isPaused: boolean;
				  }
			)[];
		} catch (err) {
			return [];
		}
	}
	static async pauseSubscription(id: string) {
		try {
			await APIInstance.get(`/payment/${id}/pause`);
		} catch (err) {}
	}
	static async resumeSubscription(id: string) {
		try {
			await APIInstance.get(`/payment/${id}/resume`);
		} catch (err) {}
	}
}
