/* eslint-disable no-var */

export interface ILocals {
	client_id: string;
}
declare global {
	var __basedir: string;

	namespace Express {
		interface Request {
			locals: ILocals;
		}
		interface Response {
			locals: ILocals;
		}
	}
}
export {} from './whatsapp';
