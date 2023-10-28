import crypto from 'crypto';
import { Request, Response } from 'express';
import { RAZORPAY_WEBHOOK_SECRET } from '../provider/razorpay/config/const';
function subscription(req: Request, res: Response) {
	const digest = crypto
		.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
		.update(JSON.stringify(req.body))
		.digest('hex');

	const razorpay_signature = req.headers['x-razorpay-signature'];

	if (razorpay_signature !== digest) {
		return res.status(400);
	}

    
}

const RazorpayWebhook = {
	subscription,
};
