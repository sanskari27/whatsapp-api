export enum LEVEL {
	CRITICAL = 'CRITICAL',
	ERROR = 'ERROR',
	HTTP = 'HTTP',
	INFO = 'INFO',
	DEBUG = 'DEBUG',
}

export const CustomLevels = {
	levels: {
		CRITICAL: 0,
		HTTP: 1,
		ERROR: 2,
		INFO: 3,
		DEBUG: 4,
	},
	colors: {
		CRITICAL: '\x1b[31m',
		INFO: '\x1b[36m',
		ERROR: '\x1b[31m\x1b[33m',
		HTTP: '\x1b[0m',
		DEBUG: '\x1b[90m',
		RESET: '\x1b[90m',
	},
};
