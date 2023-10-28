import RazorpayAPI from '../../config/RazorpayAPI';

async function getPayment(payment_id: string) {
	const payment = await RazorpayAPI.payments.fetch(payment_id);

	return {
		payment_id: payment.id,
		amount: Number(payment.amount) / 100,
		currency: payment.currency,
		order_id: payment.order_id,
		status: payment.status,
	};
}
export default {
	getPayment,
};
