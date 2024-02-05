import { ServerError } from '../../types';

const USER_ERRORS = {
	NOT_FOUND: {
		STATUS: 404,
		TITLE: 'NOT_FOUND',
		MESSAGE: 'The requested resource was not found.',
	},
	INVALID_PASSWORD: {
		STATUS: 400,
		TITLE: 'INVALID_PASSWORD',
		MESSAGE: 'Provided password is incorrect',
	},
	USERNAME_ALREADY_EXISTS: {
		STATUS: 400,
		TITLE: 'USERNAME_ALREADY_EXISTS',
		MESSAGE: 'Provided username already exists',
	},
	NOT_BUSINESS_CONTACT: {
		STATUS: 500,
		TITLE: 'NOT_BUSINESS_CONTACT',
		MESSAGE: 'The contact is not a business contact.',
	},
} satisfies {
	[error: string]: ServerError;
};

export default USER_ERRORS;
