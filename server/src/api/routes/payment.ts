import express from 'express';
import { PaymentController } from '../controller';

const router = express.Router();

router.route('/initiate').post(PaymentController.initiatePaymentTransaction);
router.route('/apply-coupon/:transaction_id').post(PaymentController.applyCoupon);
router
	.route('/initiate-razorpay/:transaction_id')
	.post(PaymentController.initializeRazorpayPayment);
router.route('/verify-payment/:transaction_id').post(PaymentController.confirmTransaction);

export default router;
