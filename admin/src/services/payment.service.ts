import APIInstance from '../config/APIInstance';
import { PaymentRecord } from '../store/types/PaymentState';

export default class PaymentService {
	static async getPaymentRecords() {
		try {
			const response = await APIInstance.get('/payment/admin/all-payments');
			return response.data.payments.map((payment: PaymentRecord) => {
				return {
					transaction_date: payment.transaction_date ?? '',
					order_id: payment.order_id ?? '',
					plan: payment.plan ?? '',
					whatsapp_numbers: payment.whatsapp_numbers ?? '',
					name: payment.name ?? '',
					phone_number: payment.phone_number ?? '',
					email: payment.email ?? '',
					admin_number: payment.admin_number ?? '',
					billing_address: {
						street: payment.billing_address.street ?? '',
						city: payment.billing_address.city ?? '',
						district: payment.billing_address.district ?? '',
						state: payment.billing_address.state ?? '',
						country: payment.billing_address.country ?? '',
						pincode: payment.billing_address.pincode ?? '',
						gstin: payment.billing_address.gstin ?? null,
					},
					gross_amount: payment.gross_amount ?? 0,
					discount: payment.discount ?? 0,
					tax: payment.tax ?? 0,
					transaction_status: payment.transaction_status ?? '',
					invoice_id: payment.invoice_id ?? null,
					coupon: payment.coupon ?? null,
				};
			});
		} catch (err) {
			//ignore
		}
	}
}
