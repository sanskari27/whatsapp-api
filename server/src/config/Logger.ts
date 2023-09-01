import winston from 'winston';
import { z } from 'zod';

const logConfiguration = {
	transports: [
		new winston.transports.Console({
			level: 'debug',
		}),
		new winston.transports.File({
			level: 'error',
			filename: `logs/error.log`,
		}),
		new winston.transports.File({
			level: 'info',
			filename: `logs/info.log`,
		}),
	],
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'DD-MMM-YYYY HH:mm:ss',
		}),
		winston.format.printf((info) => {
			const { level, message, timestamp, label } = info;
			const msg = typeof message === 'object' ? JSON.stringify(message) : message;
			const hasLabel = z
				.string()
				.nonempty()
				.transform((val) => val.trim())
				.safeParse(label).success;

			if (!hasLabel) {
				return `${level}: ${[timestamp]}: ${msg}`;
			}
			return `${level}: ${label}: ${[timestamp]}: ${msg}`;
		})
	),
};

const logger = winston.createLogger(logConfiguration);

export default logger;
