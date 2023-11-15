import winston from 'winston';
import { LogLevel } from '.';
import { CustomLevels, LEVEL } from './config';
import ConsoleLogger from './transporter/ConsoleLogger';
import FileLogger from './transporter/FileLogger';

function prettyPrint() {
	return winston.format.combine(winston.format.prettyPrint({ depth: 30 }));
}
function json() {
	return winston.format.combine(winston.format.json({ maximumDepth: 30 }));
}

function formatWithColor(color: string): winston.Logform.Format {
	return winston.format.combine(
		winston.format.printf((info) => {
			const { message, timestamp, label } = info;
			let logLine = '';
			if (!label) {
				logLine = `[${timestamp}]: ${message}`;
			} else {
				logLine = `[${timestamp}]: ${label}: ${message}`;
			}
			return `${color}${logLine}${CustomLevels.colors.RESET}`;
		})
	);
}

const logger = winston.createLogger({
	levels: CustomLevels.levels,
	level: LogLevel.DEBUG,
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'DD-MMM-YYYY HH:mm:ss',
		}),
		winston.format.prettyPrint({ colorize: true })
	),
	transports: [
		new ConsoleLogger({
			level: LEVEL.CRITICAL,
			format: winston.format.combine(winston.format.prettyPrint({ colorize: true })),
		}),
		new ConsoleLogger({
			level: LEVEL.HTTP,
			format: formatWithColor(CustomLevels.colors.HTTP),
		}),
		new ConsoleLogger({
			level: LEVEL.STATUS,
			format: formatWithColor(CustomLevels.colors.STATUS),
		}),
		new ConsoleLogger({
			level: LEVEL.INFO,
			format: formatWithColor(CustomLevels.colors.INFO),
		}),
		new FileLogger({
			level: LEVEL.DEBUG,
			filename: `logs/${LEVEL.CRITICAL.toLowerCase()}.log`,
			format: prettyPrint(),
		}),
		new FileLogger({
			level: LEVEL.INFO,
			filename: `logs/${LEVEL.INFO.toLowerCase()}.log`,
			format: prettyPrint(),
		}),
		new FileLogger({
			level: LEVEL.STATUS,
			filename: `logs/${LEVEL.STATUS.toLowerCase()}.log`,
			format: json(),
		}),
		new FileLogger({
			level: LEVEL.HTTP,
			filename: `logs/${LEVEL.HTTP.toLowerCase()}.log`,
			format: prettyPrint(),
		}),
	],
});
export default logger;
