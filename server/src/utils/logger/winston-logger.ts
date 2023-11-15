import winston from 'winston';
import { LogLevel } from '.';
import { CustomLevels, LEVEL } from './config';
import ConsoleLogger from './transporter/ConsoleLogger';
import ErrorConsoleLogger from './transporter/ErrorConsoleLogger';
import FileLogger from './transporter/FileLogger';

function prettyPrint() {
	return winston.format.combine(winston.format.prettyPrint({ depth: 30 }));
}
function json() {
	return winston.format.combine(winston.format.json({ maximumDepth: 30 }));
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
		new ErrorConsoleLogger({ level: LEVEL.CRITICAL, color: CustomLevels.colors.CRITICAL }),
		new ErrorConsoleLogger({ level: LEVEL.ERROR, color: CustomLevels.colors.ERROR }),
		new ConsoleLogger({
			level: LEVEL.INFO,
			format: winston.format.combine(
				winston.format.printf((info) => {
					const { message, timestamp, label } = info;
					let logLine = '';
					if (!label) {
						logLine = `[${timestamp}]: ${message}`;
					} else {
						logLine = `[${timestamp}]: ${label}: ${message}`;
					}
					return `${CustomLevels.colors.INFO}${logLine}${CustomLevels.colors.RESET}`;
				})
			),
		}),
		new ConsoleLogger({
			level: LEVEL.DEBUG,
			format: winston.format.prettyPrint({ colorize: true }),
		}),
		new FileLogger({
			level: LEVEL.CRITICAL,
			filename: `logs/${LEVEL.CRITICAL.toLowerCase()}-%DATE%.log`,
			format: prettyPrint(),
		}),
		new FileLogger({
			level: LEVEL.ERROR,
			filename: `logs/${LEVEL.ERROR.toLowerCase()}-%DATE%.log`,
			format: prettyPrint(),
		}),
		new FileLogger({
			level: LEVEL.HTTP,
			filename: `logs/${LEVEL.HTTP.toLowerCase()}-%DATE%.log`,
			format: prettyPrint(),
		}),
		new FileLogger({
			level: LEVEL.INFO,
			filename: `logs/${LEVEL.INFO.toLowerCase()}-%DATE%.log`,
			format: json(),
		}),
	],
});
export default logger;
