import DateUtils from '../utils/DateUtils';
import { getRandomNumber } from '../utils/ExpressUtils';

export default class TimeGenerator implements IterableIterator<Date> {
	private currentDate: moment.Moment;
	private startTime: moment.Moment;
	private endTime: moment.Moment;
	private min_delay: number;
	private max_delay: number;
	private batch_size: number;
	private batch_delay: number;
	private count: number;

	constructor(
		details: Partial<{
			startDate: string;
			startTime: string;
			endTime: string;
			min_delay: number;
			max_delay: number;
			batch_size: number;
			batch_delay: number;
		}> = {}
	) {
		const startDate = DateUtils.getMoment(details.startDate ?? DateUtils.getDate(), 'YYYY-MM-DD');
		this.startTime = DateUtils.getMoment(details.startTime ?? '10:00', 'HH:mm');
		this.endTime = DateUtils.getMoment(details.endTime ?? '18:00', 'HH:mm');
		this.min_delay = details.min_delay ?? 2;
		this.max_delay = details.max_delay ?? 2;
		this.batch_size = details.batch_size ?? 5;
		this.batch_delay = details.batch_delay ?? 120;
		this.count = 0;

		const calculated_date = startDate
			.hours(this.startTime.hours())
			.minutes(this.startTime.minutes())
			.seconds(this.startTime.seconds());

		const timeNow = DateUtils.getMomentNow();
		if (timeNow.isBefore(calculated_date)) {
			this.currentDate = calculated_date;
		} else {
			this.currentDate = timeNow;
		}
	}

	public setStartTime(startTime: string) {
		this.startTime = DateUtils.getMoment(startTime, 'HH:mm');
		return this;
	}

	public setEndTime(endTime: string) {
		this.endTime = DateUtils.getMoment(endTime, 'HH:mm');
		return this;
	}

	public next(custom_delay?: number): IteratorResult<Date, Date> {
		let delay = 0;
		if (custom_delay !== undefined) {
			delay = custom_delay;
		} else {
			delay = getRandomNumber(this.min_delay, this.max_delay);
		}
		this.currentDate.add(delay, 'seconds');

		if (this.count++ % this.batch_size === 0) {
			this.currentDate.add(this.batch_delay, 'seconds');
		}

		if (!DateUtils.isTimeBetween(this.startTime, this.endTime, this.currentDate)) {
			this.currentDate
				.add(1, 'day')
				.hours(this.startTime.hours())
				.minutes(this.startTime.minutes())
				.seconds(this.startTime.seconds() + 1);
		}
		return { value: this.currentDate.toDate(), done: false };
	}

	[Symbol.iterator](): IterableIterator<Date> {
		return this;
	}
}
