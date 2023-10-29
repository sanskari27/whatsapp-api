import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BILLING_PLANS_DETAILS, BILLING_PLANS_TYPE } from '../../../config/const';
import PaymentBucketService from '../../../database/services/payments/payment-bucket';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { Respond, idValidator } from '../../../utils/ExpressUtils';

async function fetchTransactionDetail(req: Request, res: Response, next: NextFunction) {
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	if (!isBucketValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}
	try {
		const paymentBucketService = await PaymentBucketService.getBucketById(bucket_id);

		const transactionDetails = paymentBucketService.getTransactionDetails();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: transactionDetails.bucket_id,
				gross_amount: transactionDetails.gross_amount,
				tax: transactionDetails.tax,
				discount: transactionDetails.discount,
				total_amount: transactionDetails.total_amount,
				status: transactionDetails.status,
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_NOT_FOUND));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

async function createPaymentBucket(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z
		.object({
			name: z.string(),
			email: z.string(),
			phone_number: z.string(),
			admin_number: z.string(),
			whatsapp_numbers: z.string().array(),
			type: z.enum(['one-time', 'subscription']),
			plan_name: z.enum([
				BILLING_PLANS_TYPE.SILVER_MONTH,
				BILLING_PLANS_TYPE.GOLD_MONTH,
				BILLING_PLANS_TYPE.PLATINUM_MONTH,
				BILLING_PLANS_TYPE.SILVER_YEAR,
				BILLING_PLANS_TYPE.GOLD_YEAR,
				BILLING_PLANS_TYPE.PLATINUM_YEAR,
			]),
			billing_address: z.object({
				street: z.string().default(''),
				city: z.string().default(''),
				district: z.string(),
				state: z.string(),
				country: z.string(),
				pincode: z.string(),
			}),
		})
		.refine((obj) => {
			const applicable_users = BILLING_PLANS_DETAILS[obj.plan_name].user_count;
			return obj.whatsapp_numbers.length <= applicable_users;
		});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	try {
		const paymentBucketService = await PaymentBucketService.createBucket(reqValidatorResult.data);

		const transactionDetails = paymentBucketService.getTransactionDetails();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: transactionDetails.bucket_id,
				gross_amount: transactionDetails.gross_amount,
				tax: transactionDetails.tax,
				discount: transactionDetails.discount,
				total_amount: transactionDetails.total_amount,
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

async function applyCoupon(req: Request, res: Response, next: NextFunction) {
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	const couponValidator = z.object({
		coupon_code: z.string(),
	});
	const validationResult = couponValidator.safeParse(req.body);

	if (!isBucketValid || !validationResult.success) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	const couponCode = validationResult.data.coupon_code;

	try {
		const bucketService = await PaymentBucketService.getBucketById(bucket_id);

		await bucketService.applyCoupon(couponCode);
		const transactionDetails = bucketService.getTransactionDetails();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: transactionDetails.bucket_id,
				gross_amount: transactionDetails.gross_amount,
				tax: transactionDetails.tax,
				discount: transactionDetails.discount,
				total_amount: transactionDetails.total_amount,
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_NOT_FOUND));
			} else if (err.isSameInstanceof(INTERNAL_ERRORS.PAYMENT_ERROR.COUPON_NOT_FOUND)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.COUPON_NOT_FOUND));
			} else if (err.isSameInstanceof(INTERNAL_ERRORS.PAYMENT_ERROR.COUPON_EXPIRED)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.COUPON_EXPIRED));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}
async function removeCoupon(req: Request, res: Response, next: NextFunction) {
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	if (!isBucketValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	try {
		const bucketService = await PaymentBucketService.getBucketById(bucket_id);

		await bucketService.removeCoupon();
		const transactionDetails = bucketService.getTransactionDetails();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: transactionDetails.bucket_id,
				gross_amount: transactionDetails.gross_amount,
				tax: transactionDetails.tax,
				discount: transactionDetails.discount,
				total_amount: transactionDetails.total_amount,
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_NOT_FOUND));
			} else if (err.isSameInstanceof(INTERNAL_ERRORS.PAYMENT_ERROR.COUPON_NOT_FOUND)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.COUPON_NOT_FOUND));
			} else if (err.isSameInstanceof(INTERNAL_ERRORS.PAYMENT_ERROR.COUPON_EXPIRED)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.COUPON_EXPIRED));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

async function initializeBucketPayment(req: Request, res: Response, next: NextFunction) {
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	if (!isBucketValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	try {
		const bucketService = await PaymentBucketService.getBucketById(bucket_id);

		const paymentDetails = await bucketService.generatePaymentLink();

		return Respond({
			res,
			status: 200,
			data: paymentDetails,
		});
	} catch (err) {
		console.log(err);

		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.PAYMENT_ERROR.PAYMENT_NOT_FOUND)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_NOT_FOUND));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

async function confirmTransaction(req: Request, res: Response, next: NextFunction) {
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);
	const order_id = req.body.order_id;
	const subscription_id = req.body.subscription_id;
	const payment_id = req.body.payment_id;

	if (!isBucketValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	try {
		const bucketService = await PaymentBucketService.getBucketById(bucket_id);
		const paymentService = bucketService.getPaymentService();
		if (bucketService.getTransactionDetails().type === 'one-time') {
			if (!order_id || !payment_id) {
				return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
			}
			await paymentService.confirmOneTimePayment(order_id, payment_id);
		} else {
			if (!subscription_id || !payment_id) {
				return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
			}
			await paymentService.acceptSubscriptionPayment(subscription_id, payment_id);
		}

		return Respond({
			res,
			status: 200,
			data: {
				message: 'Bucket Purchase Completed',
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
				return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
			} else if (err.isSameInstanceof(INTERNAL_ERRORS.RAZORPAY_ERRORS.ORDER_PENDING)) {
				return next(new APIError(API_ERRORS.PAYMENT_ERRORS.ORDER_PENDING));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

const TokenController = {
	fetchTransactionDetail,
	createPaymentBucket,
	applyCoupon,
	removeCoupon,
	initializeBucketPayment,
	confirmTransaction,
};

export default TokenController;
