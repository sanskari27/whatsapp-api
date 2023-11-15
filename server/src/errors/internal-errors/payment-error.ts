import { ServerError } from '../../types';

const PAYMENT_ERROR = {
	PAYMENT_SERVICE_UNINITIALIZED: {
		STATUS: 500,
		TITLE: 'PAYMENT_SERVICE_UNINITIALIZED',
		MESSAGE: 'Initialize the payment first.',
	},
	PAYMENT_NOT_FOUND: {
		STATUS: 404,
		TITLE: 'PAYMENT_NOT_FOUND',
		MESSAGE: 'The payment ID you entered is invalid.',
	},
	COUPON_NOT_FOUND: {
		STATUS: 404,
		TITLE: 'COUPON_NOT_FOUND',
		MESSAGE: 'The coupon you entered is invalid.',
	},
	COUPON_USAGE_EXCEEDED: {
		STATUS: 400,
		TITLE: 'COUPON_USAGE_EXCEEDED',
		MESSAGE: 'You can use this coupon a certain amount to time.',
	},
	COUPON_EXPIRED: {
		STATUS: 400,
		TITLE: 'COUPON_EXPIRED',
		MESSAGE: 'The coupon you entered is expired.',
	},
	ORDER_PENDING: {
		STATUS: 400,
		TITLE: 'ORDER_PENDING',
		MESSAGE: 'The order is pending.',
	},
	PAYMENT_REQUIRED: {
		STATUS: 400,
		TITLE: 'PAYMENT_REQUIRED',
		MESSAGE: 'You need to make a payment to access this feature.',
	},
	ACCESS_DENIED: {
		STATUS: 400,
		TITLE: 'ACCESS_DENIED',
		MESSAGE: 'You are not authorized to access this feature',
	},
} satisfies {
	[error: string]: ServerError;
};

export default PAYMENT_ERROR;
