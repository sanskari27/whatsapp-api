import express from 'express';
import { RazorpayWebhook } from '../../webhook';

const router = express.Router();

router.route('/razorpay/subscription').post(RazorpayWebhook.subscription);
router.route('/razorpay/payment').post(RazorpayWebhook.payment);

export default router;
