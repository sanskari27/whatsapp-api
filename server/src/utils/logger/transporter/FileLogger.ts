import { transports } from 'winston';

export default class FileLogger extends transports.File {
	constructor(options: transports.FileTransportOptions) {
		super(options);
		this.level = options.level as string;
	}

	log(info: any, callback: () => void) {
		if (info.level === this.level && super.log) {
			super.log(info, callback);
		} else {
			callback();
		}
	}
}
