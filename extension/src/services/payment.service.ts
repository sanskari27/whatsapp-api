import APIInstance from '../config/APIInstance';

export default class PaymentService {
	static async isPaymentVerified() {
		try {
			await APIInstance.get(`/payment/is-payment-valid`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
