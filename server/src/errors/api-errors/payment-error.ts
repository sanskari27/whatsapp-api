import { ServerError } from '../../types';

const PAYMENT_ERROR = {
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
	COUPON_EXPIRED: {
		STATUS: 400,
		TITLE: 'COUPON_EXPIRED',
		MESSAGE: 'The coupon you entered is expired.',
	},
} satisfies {
	[error: string]: ServerError;
};

export default PAYMENT_ERROR;
