import { APIError } from '../../types';

const COMMON_ERRORS = {
	INTERNAL_SERVER_ERROR: {
		STATUS: 500,
		TITLE: 'INTERNAL_SERVER_ERROR',
		MESSAGE: 'There was an error while processing your request. Please try again later.',
	},
	INVALID_FIELDS: {
		STATUS: 400,
		TITLE: 'INVALID_FIELDS',
		MESSAGE: 'The request contains invalid fields. Please try again later.',
	},
	NOT_FOUND: {
		STATUS: 404,
		TITLE: 'NOT_FOUND',
		MESSAGE: 'The requested resource was not found. Please try again later.',
	},
	FILE_UPLOAD_ERROR: {
		STATUS: 500,
		TITLE: 'FILE_UPLOAD_ERROR',
		MESSAGE: 'There was an error while uploading the file. Please try again later.',
	},
	ALREADY_EXISTS: {
		STATUS: 400,
		TITLE: 'ALREADY_EXISTS',
		MESSAGE: 'The requested resource already exists. Please try again later.',
	},
} satisfies {
	[error: string]: APIError;
};

export default COMMON_ERRORS;
