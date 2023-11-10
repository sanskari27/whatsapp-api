import express from 'express';
import { VerifyClientID } from '../../middleware';
import { PaymentController } from '../controller';

const router = express.Router();

router.route('/initiate').post(PaymentController.createPaymentBucket);

router.route('/:bucket_id/details').get(PaymentController.fetchTransactionDetail);
router.route('/:bucket_id/verify-payment').post(PaymentController.confirmTransaction);
router.route('/:bucket_id/apply-coupon').post(PaymentController.applyCoupon);
router.route('/:bucket_id/remove-coupon').post(PaymentController.removeCoupon);
router.route('/:bucket_id/initiate-razorpay').post(PaymentController.initializeBucketPayment);

router
	.route('/:subscription_id/pause')
	.all(VerifyClientID)
	.post(PaymentController.pauseSubscription);
router
	.route('/:subscription_id/resume')
	.all(VerifyClientID)
	.post(PaymentController.resumeSubscription);

router.route('/').get(PaymentController.fetchTransactions);

export default router;
