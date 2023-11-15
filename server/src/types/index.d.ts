/* eslint-disable no-var */

import { IUser } from './user';

export { APIError } from './server-error';

declare global {
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
	request_id: string;
	user: IUser;
}

export { APIError, default as ServerError } from './server-error';
