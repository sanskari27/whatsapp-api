import PAYMENT_ERROR from '../internal-errors/payment-error';
import APIError from './APIError';
import USER_ERRORS from './auth-errors';
import COMMON_ERRORS from './common-errors';

export default APIError;

const API_ERRORS = {
	USER_ERRORS: USER_ERRORS,
	COMMON_ERRORS: COMMON_ERRORS,
	PAYMENT_ERRORS: PAYMENT_ERROR,
};

export { API_ERRORS, USER_ERRORS, COMMON_ERRORS };
