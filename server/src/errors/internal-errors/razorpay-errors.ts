import { ServerError } from '../../types';

const RAZORPAY_ERRORS = {
	CUSTOMER_ERROR: {
		STATUS: 500,
		TITLE: 'CUSTOMER_ERROR',
		MESSAGE: 'Unable to add customer',
	},
	ORDER_NOT_FOUND: {
		STATUS: 404,
		TITLE: 'ORDER_NOT_FOUND',
		MESSAGE: 'The order ID you entered is invalid.',
	},
	ORDER_ALREADY_PAID: {
		STATUS: 400,
		TITLE: 'ORDER_ALREADY_PAID',
		MESSAGE: 'The order has already been paid.',
	},
	ORDER_PENDING: {
		STATUS: 400,
		TITLE: 'ORDER_PENDING',
		MESSAGE: 'The order is still pending.',
	},
} satisfies {
	[error: string]: ServerError;
};

export default RAZORPAY_ERRORS;
