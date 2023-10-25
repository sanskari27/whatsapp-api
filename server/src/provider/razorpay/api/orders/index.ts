import RazorpayAPI from '../../config/RazorpayAPI';

type Props = {
	amount: number;
	reference_id: string;
	customer_id: string;
	data?: { [key: string]: string };
};

async function createOrder({ amount, customer_id, reference_id, data = {} }: Props) {
	const amount_in_paise = amount * 100;
	const order = await RazorpayAPI.orders.create({
		amount: amount_in_paise,
		currency: 'INR',
		receipt: reference_id,
		customer_id: customer_id,
		notes: data,
	});

	return {
		id: order.id,
		amount: Number(order.amount) / 100,
		currency: order.currency,
		reference_id: order.receipt,
		status: order.status,
	};
}

async function getOrder(order_id: string) {
	const order = await RazorpayAPI.orders.fetch(order_id);

	return {
		id: order.id,
		amount: Number(order.amount) / 100,
		currency: order.currency,
		reference_id: order.receipt,
		status: order.status,
	};
}

async function getOrderStatus(order_id: string): Promise<'created' | 'attempted' | 'paid'> {
	const order = await getOrder(order_id);
	return order.status;
}

export default {
	createOrder,
	getOrder,
	getOrderStatus,
};
