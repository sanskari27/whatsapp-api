/* eslint-disable no-var */

import { Document, Types } from 'mongoose';
import winston from 'winston';

export { APIError } from './server-error';

declare global {
	var logger: winston.Logger;
	var __basedir: string;
	var __augmont_auth_token: string;

	namespace Express {
		interface Request {
			locals: Locals;
		}
		interface Response {
			locals: Locals;
		}
	}
}
export interface Locals {
	client_id: string;
}

export { default as ServerError, APIError } from './server-error';
