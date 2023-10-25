import APIInstance from '../config/APIInstance';

export default class PaymentService {
	static async isPaymentVerified() {
		try {
			const { data } = await APIInstance.get(`/payment/is-payment-valid`);

			const { isSubscribed, isNew, can_send_message } = data as {
				isSubscribed: boolean;
				isNew: boolean;
				can_send_message: boolean;
			};
			return { isSubscribed, isNew, can_send_message };
		} catch (err) {
			return { isSubscribed: false, isNew: false, can_send_message: false };
		}
	}
}
