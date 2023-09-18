import { ServerError } from '../../types';

const RAZORPAY_ERRORS = {
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
