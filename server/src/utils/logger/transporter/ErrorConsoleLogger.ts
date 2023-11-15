import winston, { transports } from 'winston';
import { LogLevel } from '..';
import { CustomLevels } from '../config';

export default class ErrorConsoleLogger extends transports.Console {
	constructor(options?: transports.FileTransportOptions & { color: string }) {
		super({
			...options,
			format: winston.format.combine(
				winston.format.printf((info) => {
					const { err, timestamp, label } = info;
					let logLine = '';
					if (!label) {
						logLine = `[${timestamp}]: Error Logged: \n${(err as Error).stack}`;
					} else {
						logLine = `[${timestamp}]: Error Logged: ${label}: \n${(err as Error).stack}`;
					}
					return `${options?.color ?? CustomLevels.colors.ERROR}${logLine}${
						CustomLevels.colors.RESET
					}`;
				})
			),
		});
		this.level = options ? (options.level as string) : LogLevel.ERROR;
	}

	log(info: any, callback: () => void) {
		if (info.level === this.level && super.log) {
			super.log(info, callback);
		} else {
			callback();
		}
	}
}
