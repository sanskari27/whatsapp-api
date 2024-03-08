import APIError from './APIError';
import InternalError from './InternalError';
import COMMON_ERRORS from './common-errors';
import PAYMENT_ERRORS from './payment-errors';
import USER_ERRORS from './user-errors';
import WHATSAPP_ERRORS from './whatsapp-error';

const ERRORS = {
	USER_ERRORS: USER_ERRORS,
	COMMON_ERRORS: COMMON_ERRORS,
	PAYMENT_ERRORS: PAYMENT_ERRORS,
	WHATSAPP_ERRORS: WHATSAPP_ERRORS,
};

export {
	APIError,
	COMMON_ERRORS,
	ERRORS,
	InternalError,
	PAYMENT_ERRORS,
	USER_ERRORS,
	WHATSAPP_ERRORS,
};
