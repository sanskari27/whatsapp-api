import express from 'express';
import { VerifyClientID } from '../../middleware';
import { PaymentController } from '../controller';

const router = express.Router();

router.route('/initiate').all(VerifyClientID).post(PaymentController.initiatePaymentTransaction);

router.route('/is-payment-valid').all(VerifyClientID).get(PaymentController.isPaymentValid);

router.route('/:transaction_id/details').get(PaymentController.fetchTransactionDetail);
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
