import { MESSAGE_SCHEDULER_TYPE } from '../../config/const';
import { campaignDB, messageDB } from '../../config/postgres';
import { ERRORS, InternalError } from '../../errors';
import TimeGenerator from '../../structures/TimeGenerator';
import { TPoll } from '../../types/poll';
import DateUtils from '../../utils/DateUtils';
import { generateBatchID } from '../../utils/ExpressUtils';
import { AccountService } from '../account';
import MessageService from './Message';

export type Message = {
	number: string;
	message: TextMessage;
	attachments: string[];
	captions: string[];
	polls: TPoll[];
	contacts: string[];
};

type TextMessage = string;

type Batch = {
	campaign_name: string;
	description: string;
	devices: string[];
	min_delay: number;
	max_delay: number;
	batch_size: number;
	batch_delay: number;
	startDate?: string;
	startsFrom?: string;
	startTime?: string;
	endTime?: string;
};

export default class CampaignService {
	private _user: AccountService;
	private messageService: MessageService;

	public constructor(user: AccountService) {
		this._user = user;
		this.messageService = new MessageService(user);
	}
	async alreadyExists(name: string) {
		const exists = await campaignDB.findUnique({
			where: {
				username_name: {
					username: this._user.username,
					name,
				},
			},
		});
		return exists !== null;
	}

	async scheduleCampaign(messages: Message[], opts: Batch) {
		if (await this.alreadyExists(opts.campaign_name)) {
			throw new InternalError(ERRORS.COMMON_ERRORS.ALREADY_EXISTS);
		}
		const campaign_id = generateBatchID();
		const _messages: string[] = [];
		const dateGenerator = new TimeGenerator(opts);
		for (const message of messages) {
			const msg = await this.messageService.scheduleMessage(
				{
					receiver: message.number,
					message: message.message ?? '',
					attachments: (message.attachments ?? []).map((a, i) => ({
						id: a,
						caption: message.captions[i],
					})),
					contacts: message.contacts ?? [],
					polls: message.polls ?? [],
					sendAt: dateGenerator.next().value,
				},
				{
					scheduled_by: MESSAGE_SCHEDULER_TYPE.CAMPAIGN,
					scheduler_id: campaign_id,
					devices: opts.devices,
				}
			);
			_messages.push(msg);
		}

		const campaign = await campaignDB.create({
			data: {
				...opts,
				id: campaign_id,
				username: this._user.username,
				name: opts.campaign_name,
				messages: {
					connect: _messages.map((id) => ({ id })),
				},
				startAt: opts.startTime,
				endAt: opts.endTime,
				startDate: opts.startDate,
				devices: {
					connect: opts.devices.map((client_id) => ({ client_id })),
				},
			},
		});
		return campaign;
	}

	async allCampaigns() {
		const campaigns = await campaignDB.findMany({
			where: { username: this._user.username },
			include: {
				messages: {
					select: {
						status: true,
					},
				},
			},
		});

		return campaigns.map((campaign) => {
			const { sent, failed, pending } = campaign.messages.reduce(
				(acc, item) => {
					if (item.status === 'SENT') {
						acc.sent += 1;
					} else if (item.status === 'FAILED') {
						acc.failed += 1;
					} else {
						acc.pending += 1;
					}
					return acc;
				},
				{
					sent: 0,
					failed: 0,
					pending: 0,
				}
			);
			return {
				campaign_id: campaign.id,
				campaignName: campaign.name,
				description: campaign.description,
				status: campaign.status,
				sent,
				failed,
				pending,
				createdAt: DateUtils.format(campaign.createdAt, 'DD-MM-YYYY HH:mm') as string,
				isPaused: campaign.status === 'PAUSED',
			};
		});
	}

	async deleteCampaign(id: string) {
		try {
			await messageDB.deleteMany({
				where: { scheduledById: id },
			});
			await campaignDB.findUnique({ where: { id } });
		} catch (err) {}
	}

	async pauseCampaign(id: string) {
		try {
			await campaignDB.update({
				where: { id },
				data: {
					status: 'PAUSED',
				},
			});
			await messageDB.updateMany({
				where: { scheduledById: id },
				data: {
					status: 'PAUSED',
				},
			});
		} catch (err) {}
	}

	async resumeCampaign(id: string) {
		try {
			await campaignDB.update({
				where: { id },
				data: {
					status: 'ACTIVE',
				},
			});
			await messageDB.updateMany({
				where: { scheduledById: id },
				data: {
					status: 'PENDING',
				},
			});
		} catch (err) {}
	}

	async generateReport(id: string) {
		const campaign = await campaignDB.findUnique({
			where: { id },
		});
		if (!campaign) {
			return [];
		}
		const messages = await messageDB.findMany({
			where: {
				scheduledById: id,
			},
			include: {
				attachments: true,
				contacts: true,
			},
		});
		return messages.map((message) => ({
			message: message.message,
			receiver: message.recipient.split('@')[0],
			attachments: message.attachments.length,
			contacts: message.contacts.length,
			polls: message.polls.length,
			campaign_name: campaign.name,
			description: campaign.description,
			status: message.status,
			scheduled_at: DateUtils.getMoment(message.sendAt).format('DD/MM/YYYY HH:mm:ss'),
		}));
	}
}
