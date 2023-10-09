import { ServerError } from '../../types';

const COMMON_ERRORS = {
	NOT_FOUND: {
		STATUS: 404,
		TITLE: 'NOT_FOUND',
		MESSAGE: 'The requested resource was not found.',
	},
	INVALID_FIELD: {
		STATUS: 400,
		TITLE: 'INVALID_FIELD',
		MESSAGE: 'The request contains an invalid field.',
	},
	WHATSAPP_NOT_READY: {
		STATUS: 400,
		TITLE: 'WHATSAPP_NOT_READY',
		MESSAGE: 'Whatsapp still not ready',
	},
} satisfies {
	[error: string]: ServerError;
};

export default COMMON_ERRORS;
