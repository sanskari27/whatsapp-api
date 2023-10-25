import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { BILLING_PLANS_DETAILS, BILLING_PLANS_TYPE } from '../../../config/const';
import { PaymentService } from '../../../database/services';
import PaymentBucketService from '../../../database/services/payment-bucket';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { Respond, idValidator } from '../../../utils/ExpressUtils';

async function fetchTransactionDetail(req: Request, res: Response, next: NextFunction) {
	const [isTransactionValid, transaction_id] = idValidator(req.params.transaction_id);
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	if (!isTransactionValid || !isBucketValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}
	try {
		const paymentBucketService = await PaymentBucketService.getBucketById(bucket_id);
		await paymentBucketService.initialize(transaction_id);

		const transactionDetails = paymentBucketService.getTransactionDetails();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: transactionDetails.bucket_id,
				transaction_id: transactionDetails.transaction_id,
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
			whatsapp_numbers: z.string().array(),
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

		await paymentBucketService.initialize();
		const transactionDetails = paymentBucketService.getTransactionDetails();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: transactionDetails.bucket_id,
				transaction_id: transactionDetails.transaction_id,
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
	const [isTransactionValid, transaction_id] = idValidator(req.params.transaction_id);
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	const couponValidator = z.object({
		coupon_code: z.string(),
	});
	const validationResult = couponValidator.safeParse(req.body);

	if (!isTransactionValid || !isBucketValid || !validationResult.success) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	const couponCode = validationResult.data.coupon_code;

	try {
		const bucketService = await PaymentBucketService.getBucketById(bucket_id);
		const paymentService = new PaymentService(bucketService.getBucket());
		await paymentService.initialize(transaction_id);

		await paymentService.applyCoupon(couponCode);
		const transactionDetails = paymentService.getTransactionDetails();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: transactionDetails.bucket_id,
				transaction_id: transactionDetails.transaction_id,
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
	const [isTransactionValid, transaction_id] = idValidator(req.params.transaction_id);
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	if (!isTransactionValid || !isBucketValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	try {
		const bucketService = await PaymentBucketService.getBucketById(bucket_id);
		const paymentService = new PaymentService(bucketService.getBucket());
		await paymentService.initialize(transaction_id);

		await paymentService.removeCoupon();
		const transactionDetails = paymentService.getTransactionDetails();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: transactionDetails.bucket_id,
				transaction_id: transactionDetails.transaction_id,
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
	const [isTransactionValid, transaction_id] = idValidator(req.params.transaction_id);
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	if (!isTransactionValid || !isBucketValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	try {
		const bucketService = await PaymentBucketService.getBucketById(bucket_id);
		const paymentService = new PaymentService(bucketService.getBucket());
		await paymentService.initialize(transaction_id);

		const paymentDetails = await paymentService.initializeRazorpay();

		return Respond({
			res,
			status: 200,
			data: {
				bucket_id: bucket_id,
				transaction_id: paymentDetails.transaction_id,
				order_id: paymentDetails.order_id,
				razorpay_options: paymentDetails.razorpay_options,
			},
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
	const [isTransactionValid, transaction_id] = idValidator(req.params.transaction_id);
	const [isBucketValid, bucket_id] = idValidator(req.params.bucket_id);

	if (!isTransactionValid || !isBucketValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	try {
		const bucketService = await PaymentBucketService.getBucketById(bucket_id);
		const paymentService = new PaymentService(bucketService.getBucket());
		await paymentService.initialize(transaction_id);
		await paymentService.confirmTransaction();

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
