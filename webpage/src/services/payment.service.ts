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
			return {
				isSubscribed: false,
				isNew: false,
				can_send_message: false,
			};
		}
	}

	static async initiateTransaction(details: {
		name: string;
		phone_number: string;
		email: string;
		type: string;
		whatsapp_numbers: string[];
		admin_number: string;
		plan_name:
			| 'SILVER_MONTH'
			| 'GOLD_MONTH'
			| 'PLATINUM_MONTH'
			| 'SILVER_YEAR'
			| 'GOLD_YEAR'
			| 'PLATINUM_YEAR';

		billing_address: {
			street: string;
			city: string;
			district: string;
			state: string;
			country: string;
			pincode: string;
			gstin: string;
		};
	}) {
		try {
			const { data } = await APIInstance.post(`/payment/initiate`, details);
			return {
				bucket_id: data.bucket_id,
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

	static async applyCoupon(bucket_id: string, coupon_code: string) {
		try {
			const { data } = await APIInstance.post(`/payment/${bucket_id}/apply-coupon`, {
				coupon_code,
			});
			return {
				bucket_id: data.bucket_id,
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

	static async details(bucket_id: string) {
		try {
			const { data } = await APIInstance.get(`/payment/${bucket_id}/details`);
			return {
				bucket_id: data.bucket_id,
				transaction_id: data.transaction_id,
				gross_amount: data.gross_amount,
				tax: data.tax,
				discount: data.discount,
				total_amount: data.total_amount,
				status: data.status,
			};
		} catch (err) {
			return null;
		}
	}

	static async removeCoupon(bucket_id: string) {
		try {
			const { data } = await APIInstance.post(`/payment/${bucket_id}/remove-coupon`);
			return {
				bucket_id: data.bucket_id,
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
	static async initiateRazorpay(bucket_id: string) {
		try {
			const { data } = await APIInstance.post(`/payment/${bucket_id}/initiate-razorpay`);
			return {
				subscription_id: data.subscription_id as string,
				payment_link: data.payment_link as string,

				bucket_id: data.bucket_id as string,
				transaction_id: data.transaction_id as string,
				order_id: data.order_id as string,
				razorpay_options: data.razorpay_options as {
					description: string;
					currency: string;
					amount: number;
					name: string;
					order_id: string;
					prefill: {
						contact: string;
						name: string;
						email: string;
					};
					key: string;
					theme: {
						color: string;
					};
				},
			};
		} catch (err) {
			return null;
		}
	}

	static async verifyPayment(bucket_id: string, order_id: string, payment_id: string) {
		try {
			await APIInstance.post(`/payment/${bucket_id}/verify-payment`, {
				order_id,
				payment_id,
			});
		} catch (err) {
			//ignore
		}
	}
}
