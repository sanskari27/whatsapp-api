import { ServerError } from '../../types';

const WHATSAPP_ERRORS = {
	INVALID_GROUP_ID: {
		STATUS: 400,
		TITLE: 'INVALID_GROUP_ID',
		MESSAGE: 'INVALID_GROUP_ID',
	},
	WHATSAPP_NOT_READY: {
		STATUS: 400,
		TITLE: 'WHATSAPP_NOT_READY',
		MESSAGE: 'Whatsapp still not ready',
	},
	BUSINESS_ACCOUNT_REQUIRED: {
		STATUS: 400,
		TITLE: 'BUSINESS_ACCOUNT_REQUIRED',
		MESSAGE: 'The user must have a business account to perform this action.',
	},
} satisfies {
	[error: string]: ServerError;
};

export default WHATSAPP_ERRORS;
