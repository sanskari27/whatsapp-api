import express from 'express';
import { PaymentController } from '../controller';
import { VerifyPayment } from '../../middleware';

const router = express.Router();

router.route('/initiate').post(PaymentController.initiatePaymentTransaction);

router.route('/is-payment-valid').all(VerifyPayment).get(PaymentController.isPaymentValid);

router.route('/:transaction_id/apply-coupon').post(PaymentController.applyCoupon);
router.route('/:transaction_id/remove-coupon').post(PaymentController.removeCoupon);
router
	.route('/:transaction_id/initiate-razorpay')
	.post(PaymentController.initializeRazorpayPayment);
router.route('/:transaction_id/verify-payment').post(PaymentController.confirmTransaction);

export default router;
