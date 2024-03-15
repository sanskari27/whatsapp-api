import { MessageService } from '.';
import { MESSAGE_SCHEDULER_TYPE } from '../../config/const';
import { dailySchedulerDB, messageDB, uploadsDB } from '../../config/postgres';
import { COMMON_ERRORS } from '../../errors';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { TPoll } from '../../types/poll';
import DateUtils from '../../utils/DateUtils';
import { FileUtils } from '../../utils/files';
import { AccountService, AccountServiceFactory } from '../account';

export default class SchedulerService {
	private _user: AccountService;

	public constructor(user: AccountService) {
		this._user = user;
	}

	public async allScheduler() {
		const scheduler = await dailySchedulerDB.findMany({
			where: { username: this._user.username },
			include: {
				attachments: true,
				contacts: true,
			},
		});
		return scheduler.map((e) => ({
			id: e.id,
			title: e.name,
			description: e.description,
			csv: e.csv,
			message: e.message,
			attachments: e.attachments.map((a) => a.id),
			contacts: e.contacts.map((c) => c.id),
			polls: e.polls,
			isActive: e.active,
			start_from: e.startAt,
			end_at: e.endAt,
		}));
	}

	public async schedulerByID(id: string) {
		const scheduler = await dailySchedulerDB.findUnique({
			where: { id },
			include: {
				attachments: true,
				contacts: true,
			},
		});

		if (!scheduler) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		return {
			id: scheduler.id,
			title: scheduler.name,
			description: scheduler.description,
			csv: scheduler.csv,
			message: scheduler.message,
			attachments: scheduler.attachments.map((a) => a.id),
			contacts: scheduler.contacts.map((c) => c.id),
			polls: scheduler.polls,
			isActive: scheduler.active,
			start_from: scheduler.startAt,
			end_at: scheduler.endAt,
		};
	}

	public async createScheduler(data: {
		title: string;
		description: string;
		devices: string[];
		message: string;
		start_from: string;
		end_at: string;
		contacts: string[];
		attachments: string[];
		csv: string;
		polls: TPoll[];
	}) {
		const scheduler = await dailySchedulerDB.create({
			data: {
				...data,
				username: this._user.username,
				name: data.title,
				devices: {
					connect: data.devices.map((client_id) => ({ client_id })),
				},
				contacts: {
					connect: data.contacts.map((id) => ({ id })),
				},
				attachments: {
					connect: data.attachments.map((id) => ({ id })),
				},
				startAt: data.start_from,
				endAt: data.end_at,
			},
		});

		return {
			id: scheduler.id,
			title: scheduler.name,
			description: scheduler.description,
			csv: scheduler.csv,
			message: scheduler.message,
			attachments: data.attachments,
			contacts: data.contacts ?? [],
			polls: scheduler.polls,
			isActive: scheduler.active,
			start_from: scheduler.startAt,
			end_at: scheduler.endAt,
		};
	}

	public async modifyScheduler(
		id: string,
		data: {
			title: string;
			description: string;
			devices: string[];
			message: string;
			start_from: string;
			end_at: string;
			contacts: string[];
			attachments: string[];
			polls: TPoll[];
		}
	) {
		const scheduler = await dailySchedulerDB.update({
			where: { id },
			data: {
				...data,
				name: data.title,
				devices: {
					connect: data.devices.map((client_id) => ({ client_id })),
				},
				contacts: {
					connect: data.contacts.map((id) => ({ id })),
				},
				attachments: {
					connect: data.attachments.map((id) => ({ id })),
				},
				startAt: data.start_from,
				endAt: data.end_at,
			},
		});

		return {
			id: scheduler.id,
			title: scheduler.name,
			description: scheduler.description,
			csv: scheduler.csv,
			message: scheduler.message,
			attachments: data.attachments,
			contacts: data.contacts ?? [],
			polls: scheduler.polls,
			isActive: scheduler.active,
			start_from: scheduler.startAt,
			end_at: scheduler.endAt,
		};
	}

	public async toggleActive(id: string) {
		const scheduler = await dailySchedulerDB.findUnique({
			where: { id },
			include: {
				attachments: true,
				contacts: true,
			},
		});

		if (!scheduler) {
			throw new InternalError(COMMON_ERRORS.NOT_FOUND);
		}
		await dailySchedulerDB.update({
			where: { id },
			data: {
				active: !scheduler?.active,
			},
		});

		return {
			id: scheduler.id,
			title: scheduler.name,
			description: scheduler.description,
			csv: scheduler.csv,
			message: scheduler.message,
			attachments: scheduler.attachments.map((a) => a.id),
			contacts: scheduler.contacts.map((c) => c.id),
			polls: scheduler.polls,
			isActive: scheduler.active,
			start_from: scheduler.startAt,
			end_at: scheduler.endAt,
		};
	}

	public async deleteBot(id: string) {
		await dailySchedulerDB.delete({ where: { id } });
	}

	public async generateReport(id: string) {
		const scheduler = await dailySchedulerDB.findUnique({
			where: { id },
			include: {
				attachments: true,
				contacts: true,
			},
		});
		if (!scheduler) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		const messages = await messageDB.findMany({
			where: {
				scheduledById: id,
				sendAt: { gte: DateUtils.getMomentNow().subtract(1, 'years').toDate() },
			},
		});

		return messages.map((message) => ({
			campaign_name: scheduler.name,
			description: scheduler.description,
			message: message.message,
			receiver: message.recipient.split('@')[0],
			attachments: scheduler.attachments.length,
			contacts: scheduler.contacts.length,
			polls: scheduler.polls.length,
			status: message.status,
			scheduled_at: DateUtils.getMoment(message.sendAt).format('DD/MM/YYYY HH:mm:ss'),
		}));
	}

	public static async scheduleDailyMessages() {
		const schedulers = await dailySchedulerDB.findMany({
			where: { active: true },
			include: {
				attachments: true,
				contacts: true,
				devices: true,
			},
		});

		const today = DateUtils.getMomentNow().format('MM-DD');

		for (const scheduler of schedulers) {
			const csv = await uploadsDB.findUnique({ where: { id: scheduler.id } });
			if (!csv || !csv.headers.includes('date') || !csv.headers.includes('month')) {
				continue;
			}
			const parsed_csv:
				| {
						[key: string]: string;
						date: string;
						month: string;
						number: string;
				  }[]
				| null = await FileUtils.readCSV(csv.filename);
			if (!parsed_csv) {
				continue;
			}
			const user = await AccountServiceFactory.findByUsername(scheduler.username);
			const schedulerService = new MessageService(user);

			for (const row of parsed_csv) {
				if (DateUtils.getMoment(row.month + '-' + row.date, 'MM-DD').format('MM-DD') !== today) {
					continue;
				}
				const time = DateUtils.getBetween(scheduler.startAt, scheduler.endAt);
				let _message = scheduler.message;

				for (const variable of csv.headers) {
					_message = _message.replace(`{{${variable}}}`, row[variable] ?? '');
				}

				schedulerService.scheduleMessage(
					{
						receiver: `${row.number}@c.us`,
						sendAt: time.toDate(),
						attachments: scheduler.attachments.map((a) => ({
							id: a.id,
							caption: a.caption ?? '',
						})),
						polls: scheduler.polls as TPoll[],
						contacts: scheduler.contacts.map(({ id }) => id),
						message: _message,
					},
					{
						scheduled_by: MESSAGE_SCHEDULER_TYPE.SCHEDULER,
						scheduler_id: scheduler.id,
						devices: scheduler.devices.map((d) => d.client_id),
					}
				);
			}
		}
	}
}
