import APIError from './APIError';
import InternalError from './InternalError';
import USER_ERRORS from './user-errors';
import COMMON_ERRORS from './common-errors';
import PAYMENT_ERROR from './payment-error';
import WHATSAPP_ERRORS from './whatsapp-error';

const ERRORS = {
	USER_ERRORS: USER_ERRORS,
	COMMON_ERRORS: COMMON_ERRORS,
	PAYMENT_ERRORS: PAYMENT_ERROR,
	WHATSAPP_ERROR: WHATSAPP_ERRORS,
};

export { APIError, COMMON_ERRORS, ERRORS, InternalError, USER_ERRORS };
