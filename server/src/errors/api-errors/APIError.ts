import ServerError from '../../config/ServerError';
import { APIError as IAPIError } from '../../types';

export default class APIError extends ServerError {
	title: string;
	message: string;
	status: number;
	error: any;
	constructor(option: IAPIError, err: any = null) {
		super(option.MESSAGE);
		Object.setPrototypeOf(this, APIError.prototype);
		this.title = option.TITLE;
		this.message = option.MESSAGE;
		this.status = option.STATUS;
		this.error = err;
	}

	serializeError() {
		return {
			title: this.title,
			message: this.message,
			status: this.status,
		};
	}

	toString() {
		return 'APIError: ' + this.status + ' - ' + this.title + ' - ' + this.message + '\n';
	}
}
