import { exec } from 'child_process';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import fs from 'fs';
import cron from 'node-cron';
import routes from './api/routes';

import { ATTACHMENTS_PATH, CSV_PATH, IS_PRODUCTION, UPLOADS_PATH } from './config/const';
import { MessageSchedulerService } from './database/services';
import APIError from './errors/api-errors';
import { WhatsappProvider } from './provider/whatsapp_provider';
import WhatsappUtils from './utils/WhatsappUtils';
import Logger from './utils/logger';

export default function (app: Express) {
	//Defines all global variables and constants

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
	app.route('/api-status').get((req, res) => {
		res.status(200).json({
			success: true,
			'active-instances-count': WhatsappProvider.getInstancesCount(),
		});
	});
	app.use((req: Request, res: Response, next: NextFunction) => {
		req.locals = {
			...req.locals,
		};
		const { headers, body, url } = req;
		res.locals.request_id = Date.now().toString();
		Logger.http(url, {
			headers,
			body,
			label: headers['client-id'] as string,
			request_id: res.locals.request_id,
		});
		next();
	});
	app.use(routes);

	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		if (err instanceof APIError) {
			if (err.status === 500) {
				if (err.error) {
					Logger.error(`API Error`, err.error, {
						request_id: res.locals.request_id,
					});
				} else {
					Logger.error(`API Error`, err, {
						request_id: res.locals.request_id,
					});
				}
			}

			return res.status(err.status).json({
				success: false,
				status: 'error',
				title: err.title,
				message: err.message,
			});
		}

		Logger.error(`Internal Server Error`, err, {
			request_id: res.locals.request_id,
		});
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
	cron.schedule('30 3 * * *', function () {
		exec('pgrep chrome | xargs kill -9', (error, stdout, stderr) => {
			if (error) {
				Logger.error('CRON - Chrome', error);
				return;
			}
			Logger.info('CRON - Chrome', `All Chrome instances have been killed`);
			process.exit(0);
		});
	});
}

function createDir() {
	fs.mkdirSync(__basedir + ATTACHMENTS_PATH, { recursive: true });
	fs.mkdirSync(__basedir + CSV_PATH, { recursive: true });
	fs.mkdirSync(__basedir + UPLOADS_PATH, { recursive: true });
}
