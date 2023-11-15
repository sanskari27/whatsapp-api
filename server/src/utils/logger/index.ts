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
	status: function (label: string, message: string) {
		winston.log(LogLevel.STATUS, { label: label, message });
	},
	http: function (message: string | object, opts?: { label?: string }) {
		winston.log(LogLevel.HTTP, { label: opts ? opts.label : undefined, message });
	},
	debug: function (message: string | object, opts?: { label: string }) {
		if (opts) {
			winston.log(LogLevel.DEBUG, { label: opts.label, message });
		} else {
			winston.log(LogLevel.DEBUG, { message });
		}
	},
};

export { LogLevel, Logger };
