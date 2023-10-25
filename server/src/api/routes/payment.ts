import express from 'express';
import { VerifyClientID } from '../../middleware';
import { PaymentController } from '../controller';

const router = express.Router();

router.route('/initiate').all(VerifyClientID).post(PaymentController.createPaymentBucket);

router.route('/:bucket_id/:transaction_id/details').get(PaymentController.fetchTransactionDetail);
router
	.route('/:bucket_id/:transaction_id/verify-payment')
	.post(PaymentController.confirmTransaction);
router
	.route('/:bucket_id/:transaction_id/apply-coupon')
	.all(VerifyClientID)
	.post(PaymentController.applyCoupon);
router
	.route('/:bucket_id/:transaction_id/remove-coupon')
	.all(VerifyClientID)
	.post(PaymentController.removeCoupon);
router
	.route('/:bucket_id/:transaction_id/initiate-razorpay')
	.all(VerifyClientID)
	.post(PaymentController.initializeBucketPayment);

export default router;
