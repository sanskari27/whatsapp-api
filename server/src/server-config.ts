import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import fs from 'fs';
import cron from 'node-cron';
import routes from './api/routes';
import logger from './config/Logger';
import { ATTACHMENTS_PATH, CSV_PATH, IS_PRODUCTION, UPLOADS_PATH } from './config/const';
import { MessageSchedulerService } from './database/services';
import APIError from './errors/api-errors';
import { WhatsappProvider } from './provider/whatsapp_provider';
import ErrorReporter from './utils/ErrorReporter';
import WhatsappUtils from './utils/WhatsappUtils';

export default function (app: Express) {
	//Defines all global variables and constants

	global.logger = logger;
	let basedir = __dirname.slice(0, __dirname.lastIndexOf('/'));
	if (IS_PRODUCTION) {
		basedir = basedir.slice(0, basedir.lastIndexOf('/'));
	}
	global.__basedir = basedir;

	//Initialize all the middleware
	app.use(express.urlencoded({ extended: true, limit: '2048mb' }));
	app.use(express.json({ limit: '2048mb' }));
	app.use(cors());
	app.use(cookieParser());
	app.use(express.static(__basedir + 'static'));
	app.use((req: Request, res: Response, next: NextFunction) => {
		req.locals = {
			...req.locals,
		};
		next();
	});
	app.route('/api-status').get((req, res) => {
		res.status(200).json({
			success: true,
			'active-instances-count': WhatsappProvider.getInstancesCount(),
		});
	});
	app.use(routes);

	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		if (err instanceof APIError) {
			if (err.status === 500) {
				if (err.error) {
					ErrorReporter.reportServerError(err.error);
				} else {
					ErrorReporter.report(err);
				}
			}

			return res.status(err.status).json({
				success: false,
				status: 'error',
				title: err.title,
				message: err.message,
			});
		}

		ErrorReporter.report(err);
		res.status(500).json({
			success: false,
			status: 'error',
			title: 'Internal Server Error',
			message: err.message,
		});
		next();
	});

	createDir();
	WhatsappUtils.resumeSessions();

	//0 0 * * *
	cron.schedule('0 */3 * * *', function () {
		WhatsappUtils.removeInactiveSessions();
		WhatsappUtils.removeUnwantedSessions();
	});
	cron.schedule('* * * * * *', function () {
		MessageSchedulerService.sendScheduledMessage();
	});
}

function createDir() {
	fs.mkdirSync(__basedir + ATTACHMENTS_PATH, { recursive: true });
	fs.mkdirSync(__basedir + CSV_PATH, { recursive: true });
	fs.mkdirSync(__basedir + UPLOADS_PATH, { recursive: true });
}
