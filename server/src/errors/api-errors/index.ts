import APIError from './APIError';
import USER_ERRORS from './auth-errors';
import COMMON_ERRORS from './common-errors';
import PAYMENT_ERROR from './payment-error';
import WHATSAPP_ERRORS from './whatsapp-error';

export default APIError;

const API_ERRORS = {
	USER_ERRORS: USER_ERRORS,
	COMMON_ERRORS: COMMON_ERRORS,
	PAYMENT_ERRORS: PAYMENT_ERROR,
	WHATSAPP_ERROR: WHATSAPP_ERRORS,
};

export { API_ERRORS, COMMON_ERRORS, USER_ERRORS };
