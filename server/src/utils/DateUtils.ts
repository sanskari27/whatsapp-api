import moment from 'moment';

const getDate = (format = 'YYYY-MM-DD') => {
	return moment().format(format);
};

const getMonth = () => {
	return moment().format('MM');
};

const getMonthName = () => {
	return moment().format('MMM');
};

const getYear = () => {
	return moment().format('YYYY');
};

const getMonthYear = () => {
	return moment().format('YYYY-MM');
};

const dateTime = () => {
	return moment().format('YYYY-MM-DD HH:mm:ss');
};

const now = (): number => {
	return moment().milliseconds();
};

const format = (date: Date | number, format = 'DD-MM-YYYY HH:mm:ss'): string => {
	return moment(date).format(format);
};

const getMoment = (date: string | Date | number, format: string | null = null) => {
	if (format === null) {
		return moment(date);
	}
	return moment(date, format);
};

const isValid = (date: string | Date, format: string | null = null) => {
	if (typeof date !== 'string' || format === null) {
		return moment(date).isValid();
	}
	return moment(date, format, true).isValid();
};

const getMomentNow = () => {
	return moment();
};

const getLocalTime = (date: Date | number, format = 'YYYY-MM-DDTHH:mm:ss.SSSZ') => {
	const instance = moment(date);
	if (instance.isUTC()) {
		instance.utcOffset(330);
		return instance.format(format);
	}
	return moment(date).local().format(format);
};

export default {
	getDate,
	getMonth,
	getYear,
	getMonthYear,
	getMonthName,
	dateTime,
	isValid,
	now,
	format,
	getMoment,
	getMomentNow,
	getLocalTime,
};
