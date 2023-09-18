import ServerError from '../../config/ServerError';
import IServerError from '../../types/server-error';
const ERROR_TITLE = 'Unhandled Error.';

export default class InternalError extends ServerError {
	title: string = ERROR_TITLE;
	message: string = ERROR_TITLE;
	status = 500;
	error: any = null;
	constructor({ STATUS, MESSAGE, TITLE }: IServerError) {
		super(ERROR_TITLE);
		Object.setPrototypeOf(this, InternalError.prototype);
		this.title = TITLE as string;
		this.message = MESSAGE as string;
		this.status = STATUS as number;
	}

	isSameInstanceof(details: IServerError) {
		return (
			this.status === details.STATUS &&
			this.title === details.TITLE &&
			this.message === details.MESSAGE
		);
	}

	serializeError() {
		return {
			title: this.title,
			message: this.message,
			status: this.status,
		};
	}
}
