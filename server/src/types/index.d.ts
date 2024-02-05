/* eslint-disable no-var */

import { Types } from 'mongoose';
import { IUser } from './user';
import IAdmin from './user/Admin';

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
	user: IUser;
	admin: IAdmin;
	data: any;
	id: Types.ObjectId;
	token: string;
}

export { IAPIError, default as ServerError } from './server-error';
