import crypto from 'crypto';
import { Request, Response } from 'express';
import PaymentBucketService from '../database/services/payments/payment-bucket';
import { RAZORPAY_WEBHOOK_SECRET } from '../provider/razorpay/config/const';
async function subscription(req: Request, res: Response) {
	const data = req.body;
	const digest = crypto
		.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
		.update(JSON.stringify(req.body))
		.digest('hex');

	const razorpay_signature = req.headers['x-razorpay-signature'];

	if (razorpay_signature !== digest) {
		return res.status(400).json({ status: 'Bad signature' });
	} else if (!data.contains.includes('payment')) {
		return res.status(400).json({ status: 'Bad Request' });
	}

	const payment = data.payload.payment.entity;
	const subscription_id = data.payload.subscription.entity.id;
	const { id: payment_id, status } = payment;

	if (status !== 'captured') {
		return res.status(400).json({ status: 'Bad Request' });
	}

	try {
		const bucketService = await PaymentBucketService.getBucketBySubscription(subscription_id);
		bucketService.getPaymentService().acceptSubscriptionPayment(subscription_id, payment_id);
		res.status(200).json({ status: 'OK' });
	} catch (err) {
		return res.status(404).json({ status: 'Not Found' });
	}
}

async function payment(req: Request, res: Response) {
	const data = req.body;
	const digest = crypto
		.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
		.update(JSON.stringify(req.body))
		.digest('hex');

	const razorpay_signature = req.headers['x-razorpay-signature'];

	if (razorpay_signature !== digest) {
		return res.status(400).json({ status: 'Bad signature' });
	} else if (!data.contains.includes('payment')) {
		return res.status(400).json({ status: 'Bad Request' });
	}
	const payment = data.payload.payment.entity;
	const { id: payment_id, order_id, status } = payment;

	if (status !== 'captured') {
		return res.status(400).json({ status: 'Bad Request' });
	}
	try {
		const bucketService = await PaymentBucketService.getBucketByOrderID(order_id);
		bucketService.getPaymentService().confirmOneTimePayment(order_id, payment_id);
		res.status(200).json({ status: 'OK' });
	} catch (err) {
		return res.status(404).json({ status: 'Not Found' });
	}
}

const RazorpayWebhook = {
	subscription,
	payment,
};

export default RazorpayWebhook;
