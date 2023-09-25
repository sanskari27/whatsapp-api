import { APIError } from '../../types';

const USER_ERRORS = {
	AUTHORIZATION_ERROR: {
		STATUS: 401,
		TITLE: 'AUTHORIZATION_ERROR',
		MESSAGE: 'The user is not authorized to perform this action.',
	},
	USER_NOT_FOUND_ERROR: {
		STATUS: 404,
		TITLE: 'USER_NOT_FOUND_ERROR',
		MESSAGE: 'The user was not found. Please try again later.',
	},
	SESSION_INVALIDATED: {
		STATUS: 404,
		TITLE: 'SESSION_INVALIDATED',
		MESSAGE: 'The session was invalidated. Please login again.',
	},
	BUSINESS_ACCOUNT_REQUIRED: {
		STATUS: 400,
		TITLE: 'BUSINESS_ACCOUNT_REQUIRED',
		MESSAGE: 'The user must have a business account to perform this action.',
	},
} satisfies {
	[error: string]: APIError;
};

export default USER_ERRORS;
