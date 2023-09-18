import { ServerError } from '../../types';

const USER_ERRORS = {
	NOT_FOUND: {
		STATUS: 404,
		TITLE: 'NOT_FOUND',
		MESSAGE: 'The requested resource was not found.',
	},
} satisfies {
	[error: string]: ServerError;
};

export default USER_ERRORS;
