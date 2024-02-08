import { Types } from 'mongoose';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import ContactCardDB from '../../repository/contact-cards';
import SchedulerDB from '../../repository/scheduler';
import IUpload from '../../types/uploads';
import { IUser } from '../../types/user';
import DateUtils from '../../utils/DateUtils';
import { FileUtils } from '../../utils/files';
import MessageSchedulerService from '../scheduled-message';

export default class SchedulerService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	public async allScheduler() {
		const scheduler = await SchedulerDB.find({
			user: this.user,
		}).populate('csv attachments shared_contact_cards');
		return scheduler.map((e) => ({
			id: e._id as Types.ObjectId,
			title: e.title,
			csv: e.csv.filename,
			message: e.message,
			attachments: e.attachments,
			shared_contact_cards: e.shared_contact_cards ?? [],
			polls: e.polls,
			isActive: e.active,
			start_from: e.start_from,
			end_at: e.end_at,
		}));
	}

	public async schedulerByID(id: Types.ObjectId) {
		const scheduler = await SchedulerDB.findById(id).populate('csv attachments shared_contact_cards');

		if (!scheduler) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		return {
			id: scheduler._id as Types.ObjectId,
			title: scheduler.title,
			csv: scheduler.csv.filename,
			message: scheduler.message,
			attachments: scheduler.attachments,
			shared_contact_cards: scheduler.shared_contact_cards ?? [],
			polls: scheduler.polls,
			isActive: scheduler.active,
			start_from: scheduler.start_from,
			end_at: scheduler.end_at,
		};
	}

	public createScheduler(data: {
		title: string;
		message: string;
		start_from: string;
		end_at: string;
		shared_contact_cards: Types.ObjectId[];
		attachments: IUpload[];
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
	}) {
		const scheduler = new SchedulerDB({
			...data,
			user: this.user,
		});

		scheduler.save();
		return {
			id: scheduler._id as Types.ObjectId,
			title: scheduler.title,
			csv: scheduler.csv.filename,
			message: scheduler.message,
			attachments: scheduler.attachments,
			shared_contact_cards: scheduler.shared_contact_cards ?? [],
			polls: scheduler.polls,
			isActive: scheduler.active,
			start_from: scheduler.start_from,
			end_at: scheduler.end_at,
		};
	}

	public async modifyScheduler(
		id: Types.ObjectId,
		data: {
			title: string;
			message: string;
			start_from: string;
			end_at: string;
			shared_contact_cards: Types.ObjectId[];
			attachments: IUpload[];
			polls: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		}
	) {
		const scheduler = await SchedulerDB.findById(id).populate('csv attachments shared_contact_cards');
		if (!scheduler) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		if (data.title) {
			scheduler.title = data.title;
		}
		if (data.message) {
			scheduler.message = data.message;
		}
		if (data.start_from) {
			scheduler.start_from = data.start_from;
		}
		if (data.end_at) {
			scheduler.end_at = data.end_at;
		}
		if (data.attachments) {
			scheduler.attachments = data.attachments;
		}
		if (data.polls) {
			scheduler.polls = data.polls;
		}
		scheduler.shared_contact_cards = await ContactCardDB.find({
			_id: { $in: data.shared_contact_cards },
		});

		await scheduler.save();

		return {
			id: scheduler._id as Types.ObjectId,
			title: scheduler.title,
			csv: scheduler.csv.filename,
			message: scheduler.message,
			attachments: scheduler.attachments,
			shared_contact_cards: scheduler.shared_contact_cards ?? [],
			polls: scheduler.polls,
			isActive: scheduler.active,
			start_from: scheduler.start_from,
			end_at: scheduler.end_at,
		};
	}

	public async toggleActive(id: Types.ObjectId) {
		const scheduler = await SchedulerDB.findById(id).populate('csv');
		if (!scheduler) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		scheduler.active = !scheduler.active;
		scheduler.save();
		return {
			id: scheduler._id as Types.ObjectId,
			title: scheduler.title,
			csv: scheduler.csv.filename,
			message: scheduler.message,
			attachments: scheduler.attachments,
			shared_contact_cards: scheduler.shared_contact_cards ?? [],
			polls: scheduler.polls,
			isActive: scheduler.active,
			start_from: scheduler.start_from,
			end_at: scheduler.end_at,
		};
	}

	public async deleteBot(id: Types.ObjectId) {
		await SchedulerDB.deleteOne({ _id: id });
	}

	public static async scheduleDailyMessages() {
		const schedulers = await SchedulerDB.find({
			active: true,
			'csv.headers': ['number', 'date'],
		}).populate('attachments shared_contact_cards csv');
		const today = DateUtils.getDate();

		for (const scheduler of schedulers) {
			const cid = WhatsappProvider.clientByUser(scheduler.user);
			const parsed_csv:
				| {
						[key: string]: string;
						date: string;
						number: string;
				  }[]
				| null = await FileUtils.readCSV(scheduler.csv.filename);
			if (!parsed_csv || !cid) {
				continue;
			}
			const schedulerService = new MessageSchedulerService(scheduler.user);

			for (const row of parsed_csv) {
				if (DateUtils.getMoment(row.date).format('YYYY-MM-DD') !== today) {
					continue;
				}
				const time = DateUtils.getBetween(scheduler.start_from, scheduler.end_at);
				let _message = scheduler.message;

				for (const variable of scheduler.csv.headers) {
					const _variable = variable.substring(2, variable.length - 2);
					_message = _message.replace(variable, row[_variable] ?? '');
				}
				schedulerService.scheduleMessage(
					{
						number: row.number,
						send_at: time.toDate(),
						attachments: scheduler.attachments.map((attachment) => ({
							name: attachment.name,
							filename: attachment.filename,
							caption: attachment.caption,
						})),
						polls: scheduler.polls,
						shared_contact_cards: scheduler.shared_contact_cards.map(
							({ _id }) => new Types.ObjectId(_id)
						),
						message: _message,
					},
					{
						client_id: cid,
					}
				);
			}
		}
	}
}
