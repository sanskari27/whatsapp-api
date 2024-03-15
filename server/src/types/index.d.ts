/* eslint-disable no-var */

import { AccountService } from '../services/account';
import { IWADevice } from './account';

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
	// user: IUser;
	// admin: IAdmin;

	account: AccountService;
	device: IWADevice;

	data: any;
	id: string;
	token: string;
}

export { IAPIError, default as ServerError } from './server-error';
