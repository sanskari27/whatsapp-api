import { exec } from 'child_process';
import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import routes from './modules';

import Logger from 'n23-logger';
import { IS_PRODUCTION } from './config/const';

export default function (app: Express) {
	//Defines all global variables and constants
	let basedir = __dirname;
	basedir = basedir.slice(0, basedir.lastIndexOf('/'));
	if (IS_PRODUCTION) {
		basedir = basedir.slice(0, basedir.lastIndexOf('/'));
	}
	global.__basedir = basedir;

	//Initialize all the middleware
	app.use(express.json());
	app.use(cors());

	app.route('/clear-cached-ram').get((req, res) => {
		exec('pgrep chrome | xargs kill -9', (error, stdout, stderr) => {
			if (error) {
				Logger.error('CRON - Chrome', error);
				return;
			}
			Logger.info('CRON - Chrome', `All Chrome instances have been killed`);
			process.exit(0);
		});
	});
	app.use((req: Request, res: Response, next: NextFunction) => {
		req.locals = {
			...req.locals,
		};
		res.locals = {
			...res.locals,
		};
		const { headers, body, url } = req;
		const client_id = headers['client-id'] as string;
		req.locals.client_id = client_id;

		if (!client_id) {
			return res.status(400).send('INVALID_CLIENT_ID');
		}

		Logger.http(url, {
			type: 'request',
			headers,
			body,
			label: headers['client-id'] as string,
			request_id: res.locals.request_id,
		});
		next();
	});
	app.use(routes);

	app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
		res.status(500).json({
			success: false,
			status: 'error',
			title: 'Internal Server Error',
			message: err.message,
		});
		next();
	});
}
