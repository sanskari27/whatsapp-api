import { APIError } from '../types';

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
	WHATSAPP_NOT_READY: {
		STATUS: 400,
		TITLE: 'WHATSAPP_NOT_READY',
		MESSAGE: 'The whatsapp session was invalidated. Please login again.',
	},
	USERNAME_ALREADY_EXISTS: {
		STATUS: 400,
		TITLE: 'USERNAME_ALREADY_EXISTS',
		MESSAGE: 'This username already exists.',
	},
	ATTACHMENT_IN_USE: {
		STATUS: 400,
		TITLE: 'ATTACHMENT_IN_USE',
		MESSAGE: 'The requested attachment could not be deleted.',
	},
	MAX_DEVICE_LIMIT_REACHED: {
		STATUS: 400,
		TITLE: 'MAX_DEVICE_LIMIT_REACHED',
		MESSAGE: 'Max device limit reached.',
	},
} satisfies {
	[error: string]: APIError;
};

export default USER_ERRORS;
