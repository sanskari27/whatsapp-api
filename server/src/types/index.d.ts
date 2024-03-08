/* eslint-disable no-var */

import { Types } from 'mongoose';
import { AccountService } from '../services/account';
import { IAccount, IWADevice } from './account';

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

	accountService: AccountService;
	account: IAccount;
	device: IWADevice;

	data: any;
	id: Types.ObjectId;
	token: string;
}

export { IAPIError, default as ServerError } from './server-error';
