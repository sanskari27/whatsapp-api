import express from 'express';
import { PaymentController } from '../controller';
import { VerifyClientID, VerifyPayment } from '../../middleware';

const router = express.Router();

router.route('/initiate').all(VerifyClientID).post(PaymentController.initiatePaymentTransaction);

router
	.route('/is-payment-valid')
	.all(VerifyClientID, VerifyPayment)
	.get(PaymentController.isPaymentValid);

router.route('/:transaction_id/verify-payment').post(PaymentController.confirmTransaction);
router
	.route('/:transaction_id/apply-coupon')
	.all(VerifyClientID)
	.post(PaymentController.applyCoupon);
router
	.route('/:transaction_id/remove-coupon')
	.all(VerifyClientID)
	.post(PaymentController.removeCoupon);
router
	.route('/:transaction_id/initiate-razorpay')
	.all(VerifyClientID)
	.post(PaymentController.initializeRazorpayPayment);

export default router;
