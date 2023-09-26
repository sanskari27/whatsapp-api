import { Request, Response, NextFunction } from 'express';
import { Respond, idValidator } from '../../../utils/ExpressUtils';
import { z } from 'zod';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { PaymentService } from '../../../database/services';
import { BASE_AMOUNT } from '../../../config/const';

async function isPaymentValid(req: Request, res: Response, next: NextFunction) {
	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function fetchTransactionDetail(req: Request, res: Response, next: NextFunction) {
	const [isIDValid, transaction_id] = idValidator(req.params.transaction_id);

	if (!isIDValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}
	try {
		const transactionDetails = await PaymentService.fetchTransactionDetails(transaction_id);

		return Respond({
			res,
			status: 200,
			data: {
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

async function initiatePaymentTransaction(req: Request, res: Response, next: NextFunction) {
	const paymentService = new PaymentService(req.locals.user);

	const transactionDetails = await paymentService.initializePayment(BASE_AMOUNT);

	return Respond({
		res,
		status: 200,
		data: {
			transaction_id: transactionDetails.transaction_id,
			gross_amount: transactionDetails.gross_amount,
			tax: transactionDetails.tax,
			discount: transactionDetails.discount,
			total_amount: transactionDetails.total_amount,
		},
	});
}

async function applyCoupon(req: Request, res: Response, next: NextFunction) {
	const [isIDValid, transaction_id] = idValidator(req.params.transaction_id);

	const couponValidator = z.object({
		coupon_code: z.string(),
	});
	const validationResult = couponValidator.safeParse(req.body);

	if (!isIDValid || !validationResult.success) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	const couponCode = validationResult.data.coupon_code;

	const paymentService = new PaymentService(req.locals.user);
	try {
		const transactionDetails = await paymentService.applyCoupon(transaction_id, couponCode);

		return Respond({
			res,
			status: 200,
			data: {
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
	const [isIDValid, transaction_id] = idValidator(req.params.transaction_id);

	if (!isIDValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	const paymentService = new PaymentService(req.locals.user);
	try {
		const transactionDetails = await paymentService.removeCoupon(transaction_id);

		return Respond({
			res,
			status: 200,
			data: {
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

async function initializeRazorpayPayment(req: Request, res: Response, next: NextFunction) {
	const [isIDValid, transaction_id] = idValidator(req.params.transaction_id);

	if (!isIDValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}

	const paymentService = new PaymentService(req.locals.user);

	try {
		const paymentDetails = await paymentService.initializeRazorpayTransaction(transaction_id);

		return Respond({
			res,
			status: 200,
			data: {
				transaction_id: paymentDetails.transaction_id,
				order_id: paymentDetails.order_id,
				razorpay_options: paymentDetails.razorpay_options,
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

async function confirmTransaction(req: Request, res: Response, next: NextFunction) {
	const [isIDValid, transaction_id] = idValidator(req.params.transaction_id);

	if (isIDValid === false) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	try {
		const paymentService = new PaymentService(req.locals.user);
		await paymentService.confirmTransaction(transaction_id);

		return Respond({
			res,
			status: 200,
			data: {
				message: 'Balance added to your wallet.',
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
	isPaymentValid,
	fetchTransactionDetail,
	initiatePaymentTransaction,
	applyCoupon,
	removeCoupon,
	initializeRazorpayPayment,
	confirmTransaction,
};

export default TokenController;
