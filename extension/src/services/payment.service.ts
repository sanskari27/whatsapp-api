import axios, { AxiosError } from 'axios';
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

	static async initiateTransaction() {
		try {
			const { data } = await APIInstance.post(`/payment/initiate`);
			return {
				transaction_id: data.transaction_id,
				gross_amount: data.gross_amount,
				tax: data.tax,
				discount: data.discount,
				total_amount: data.total_amount,
			};
		} catch (err) {
			return null;
		}
	}

	static async applyCoupon(transaction_id: string, coupon_code: string) {
		try {
			const { data } = await APIInstance.post(`/payment/${transaction_id}/apply-coupon`, {
				coupon_code,
			});
			return {
				transaction_id: data.transaction_id,
				gross_amount: data.gross_amount,
				tax: data.tax,
				discount: data.discount,
				total_amount: data.total_amount,
			};
		} catch (err) {
			return null;
		}
	}

	static async removeCoupon(transaction_id: string) {
		try {
			const { data } = await APIInstance.post(`/payment/${transaction_id}/remove-coupon`);
			return {
				transaction_id: data.transaction_id,
				gross_amount: data.gross_amount,
				tax: data.tax,
				discount: data.discount,
				total_amount: data.total_amount,
			};
		} catch (err) {
			return null;
		}
	}
}
