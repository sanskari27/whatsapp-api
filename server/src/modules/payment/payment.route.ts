import express from 'express';
import { IDValidator } from '../../middleware/idValidator';
import PaymentController from './payment.controller';
import { CouponValidator, CreateBucketValidator } from './payment.validator';
import VerifyAccount from '../../middleware/VerifyAccount';

const router = express.Router();

router.route('/admin/all-payments').get(PaymentController.fetchAllTransactions);

router.route('/initiate').all(CreateBucketValidator).post(PaymentController.createPaymentBucket);

router.route('/:id/details').all(IDValidator).get(PaymentController.fetchTransactionDetail);

router.route('/:id/verify-payment').all(IDValidator).post(PaymentController.confirmTransaction);

router
	.route('/:id/apply-coupon')
	.all(IDValidator, CouponValidator)
	.post(PaymentController.applyCoupon);

router.route('/:id/remove-coupon').all(IDValidator).post(PaymentController.removeCoupon);

router
	.route('/:id/initiate-razorpay')
	.all(IDValidator)
	.post(PaymentController.initializeBucketPayment);

router
	.route('/:id/pause')
	.all(VerifyAccount, IDValidator)
	.post(PaymentController.pauseSubscription);

router
	.route('/:id/resume')
	.all(VerifyAccount, IDValidator)
	.post(PaymentController.resumeSubscription);

router.route('/:id/invoice').all(VerifyAccount).get(PaymentController.downloadInvoice);

router.route('/').all(VerifyAccount).get(PaymentController.fetchUserTransactions);

export default router;
