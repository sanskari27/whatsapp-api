import { transports } from 'winston';

export default class ConsoleLogger extends transports.Console {
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
