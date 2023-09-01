import APIError from './APIError';
import USER_ERRORS from './auth-errors';
import COMMON_ERRORS from './common-errors';

export default APIError;

const API_ERRORS = {
	USER_ERRORS: USER_ERRORS,
	COMMON_ERRORS: COMMON_ERRORS,
};

export { API_ERRORS, USER_ERRORS, COMMON_ERRORS };
