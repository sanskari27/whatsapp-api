import express from 'express';
import { PaymentController } from '../controller';
import { VerifyPayment } from '../../middleware';

const router = express.Router();

router.route('/initiate').post(PaymentController.initiatePaymentTransaction);
router.route('/apply-coupon/:transaction_id').post(PaymentController.applyCoupon);
router
	.route('/initiate-razorpay/:transaction_id')
	.post(PaymentController.initializeRazorpayPayment);
router.route('/verify-payment/:transaction_id').post(PaymentController.confirmTransaction);

router.route('/is-payment-valid').all(VerifyPayment).get(PaymentController.isPaymentValid);

export default router;
