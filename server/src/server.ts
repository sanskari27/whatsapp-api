import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import configServer from './server-config';

import { PORT } from './config/const';
import Date from './utils/DateUtils';
import logger from './config/Logger';
import ErrorReporter from './utils/ErrorReporter';
import { SocketServerProvider } from './socket';
import connectDB from './config/DB';

//  ------------------------- Setup Variables
const app = express();

configServer(app);

connectDB()
	.then(() => {
		logger.info('Database connected');
	})
	.catch((err) => {
		logger.error(err.message, {
			label: 'Running Status - Database Connection Failed',
		});
		process.exit();
	});

const server = app.listen(PORT, async () => {
	SocketServerProvider.getInstance(server);
	logger.info(`Server started on port ${PORT}`, {
		label: 'Running Status',
	});
});

process.on('unhandledRejection', (err: Error) => {
	ErrorReporter.report(err);
	logger.error(`Logged Error at ${Date.dateTime()}: ${err.message}`);
	server.close(() => process.exit(1));
});
