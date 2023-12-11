import { Request } from 'express';
import ServerError from '../config/ServerError';

const report = async (err: Error, req: Request | null = null) => {
	console.log('Error Reporter: ', err);
};

const reportJSON = async (errorObj: any) => {
	console.log('Error Reporter: ', errorObj);
};

const reportServerError = async (err: ServerError) => {
	console.log('Error Reporter: ', err?.message);
};

export default { report, reportJSON, reportServerError };
