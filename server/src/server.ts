import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import configServer from './server-config';

import connectDB from './config/DB';
import logger from './config/Logger';
import cache from './config/cache';
import { PORT } from './config/const';
import { SocketServerProvider } from './socket';
import Date from './utils/DateUtils';
import ErrorReporter from './utils/ErrorReporter';

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
	await cache.connect();
	logger.info(`Server started on port ${PORT}`, {
		label: 'Running Status',
	});
});

process.on('unhandledRejection', (err: Error) => {
	ErrorReporter.report(err);
	logger.error(`Logged Error at ${Date.dateTime()}: ${err.message}`);
	server.close(() => process.exit(1));
});
