import { ServerError } from '../../types';

const USER_ERRORS = {
	NOT_FOUND: {
		STATUS: 404,
		TITLE: 'NOT_FOUND',
		MESSAGE: 'The requested resource was not found.',
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
