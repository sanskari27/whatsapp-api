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
} satisfies {
	[error: string]: ServerError;
};

export default WHATSAPP_ERRORS;
