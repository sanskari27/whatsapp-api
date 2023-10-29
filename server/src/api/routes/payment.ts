import express from 'express';
import { PaymentController } from '../controller';

const router = express.Router();

router.route('/initiate').post(PaymentController.createPaymentBucket);

router.route('/:bucket_id/details').get(PaymentController.fetchTransactionDetail);
router.route('/:bucket_id/verify-payment').post(PaymentController.confirmTransaction);
router.route('/:bucket_id/apply-coupon').post(PaymentController.applyCoupon);
router.route('/:bucket_id/remove-coupon').post(PaymentController.removeCoupon);
router.route('/:bucket_id/initiate-razorpay').post(PaymentController.initializeBucketPayment);

router.route('/:subscription_id/pause').post(PaymentController.pauseSubscription);
router.route('/:subscription_id/resume').post(PaymentController.resumeSubscription);

export default router;
