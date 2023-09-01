import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import logger from './config/Logger';
import { IS_PRODUCTION } from './config/const';
import routes from './api/routes';
import APIError from './errors/api-errors';
import ErrorReporter from './utils/ErrorReporter';

export default function (app: Express) {
	//Defines all global variables and constants

	global.logger = logger;
	let basedir = __dirname.slice(0, __dirname.lastIndexOf('/'));
	if (IS_PRODUCTION) {
		basedir = basedir.slice(0, basedir.lastIndexOf('/'));
	}
	global.__basedir = basedir;

	//Initialize all the middleware
	app.use(express.urlencoded({ extended: true, limit: '50mb' }));
	app.use(express.json({ limit: '50mb' }));
	app.use(cors());
	app.use(cookieParser());
	app.use(express.static(__basedir + 'static'));
	app.use((req: Request, res: Response, next: NextFunction) => {
		req.locals = {
			...req.locals,
		};
		next();
	});
	app.use(routes);

	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		if (err instanceof APIError) {
			if (err.status === 500) {
				ErrorReporter.reportServerError(err.error);
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
}
