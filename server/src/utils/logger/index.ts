import { LEVEL as LogLevel } from './config';
import winston from './winston-logger';

const Logger = {
	log: function (level: LogLevel, message: string | object, label?: string) {
		winston.log(level, message);
	},
	info: function (label: string, message: string) {
		winston.log(LogLevel.INFO, { label: label, message });
	},
	critical: function (label: string, err: Error) {
		winston.log(LogLevel.CRITICAL, { label, err });
	},
	error: function (label: string, err: Error, extras?: object) {
		winston.log(LogLevel.ERROR, { label: label, err });
	},
	http: function (
		url: string,
		options?: {
			label?: string;
			headers?: object;
			body?: object;
			status?: number;
			response?: object;
		} & {
			[key: string]: string | number | object;
		}
	) {
		winston.log(LogLevel.HTTP, { url, ...options });
	},
	debug: function (message: string | object, opts?: { label: string }) {
		if (opts) {
			winston.log(LogLevel.DEBUG, { label: opts.label, message });
		} else {
			winston.log(LogLevel.DEBUG, { message });
		}
	},
};

export default Logger;

export { LogLevel };
