import fs from 'fs';
import { Types } from 'mongoose';
import Logger from 'n23-logger';
import { MessageMedia, Poll } from 'whatsapp-web.js';
import { ATTACHMENTS_PATH, PROMOTIONAL_MESSAGE_1, PROMOTIONAL_MESSAGE_2 } from '../../config/const';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import ScheduledMessageDB from '../../repository/scheduled-message';
import UploadDB from '../../repository/uploads';
import IScheduledMessage from '../../types/scheduled-message';
import { IUser } from '../../types/user';
import DateUtils from '../../utils/DateUtils';
import { generateBatchID, getRandomNumber } from '../../utils/ExpressUtils';
import UserService from '../user';

export type Message = {
	number: string;
	message: TextMessage;
	attachments: {
		name: string;
		filename: string;
		caption: string | undefined;
	}[];
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];
	shared_contact_cards: Types.ObjectId[];
};

type TextMessage = string;

type Batch = {
	campaign_id: string;
	campaign_name: string;
	min_delay: number;
	max_delay: number;
	batch_size: number;
	batch_delay: number;
	startTime?: string;
	endTime?: string;
	client_id: string;
};

export default class MessageSchedulerService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}
	async alreadyExists(name: string) {
		const exists = await ScheduledMessageDB.exists({ sender: this.user, campaign_name: name });
		return exists !== null;
	}

	async scheduleCampaign(messages: Message[], opts: Batch) {
		const docPromise: Promise<
			IScheduledMessage & {
				_id: Types.ObjectId;
			}
		>[] = [];

		const batch_id = generateBatchID();

		const startMoment = DateUtils.getMoment(opts.startTime ?? '00:00', 'HH:mm');
		const endMoment = DateUtils.getMoment(opts.endTime ?? '23:59', 'HH:mm');
		const scheduledTime = DateUtils.getMomentNow();
		if (startMoment !== undefined && scheduledTime.isBefore(startMoment)) {
			scheduledTime
				.hours(startMoment.hours())
				.minutes(startMoment.minutes())
				.seconds(startMoment.seconds() + 1);
		}

		const time_now = DateUtils.getMomentNow();

		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];
			if (
				!DateUtils.isTimeBetween(
					startMoment.format('HH:mm'),
					endMoment.format('HH:mm'),
					scheduledTime.format('HH:mm')
				)
			) {
				scheduledTime
					.add(1, 'day')
					.hours(startMoment.hours())
					.minutes(startMoment.minutes())
					.seconds(startMoment.seconds() + 1);
			}
			const delay = getRandomNumber(opts.min_delay, opts.max_delay);
			scheduledTime.add(delay, 'seconds');

			if (i % opts.batch_size === 0) {
				scheduledTime.add(opts.batch_delay, 'seconds');
			}

			docPromise.push(
				ScheduledMessageDB.create({
					sender: this.user,
					sender_client_id: opts.client_id,
					receiver: message.number,
					message: message.message ?? '',
					attachments: message.attachments ?? [],
					shared_contact_cards: message.shared_contact_cards ?? [],
					polls: message.polls ?? [],
					sendAt: scheduledTime.toDate(),
					batch_id: batch_id,
					campaign_name: opts.campaign_name,
					campaign_id: opts.campaign_id,
					campaign_created_at: time_now.toDate(),
				})
			);
		}

		return await Promise.all(docPromise);
	}

	async scheduleLeadNurturingMessage(
		messages: (Partial<Message> & { number: string; send_at: Date })[],
		opts: {
			client_id: string;
		}
	) {
		const docPromise: Promise<
			IScheduledMessage & {
				_id: Types.ObjectId;
			}
		>[] = [];

		const batch_id = generateBatchID();

		const time_now = DateUtils.getMomentNow();

		for (let i = 0; i < messages.length; i++) {
			const message = messages[i];

			docPromise.push(
				ScheduledMessageDB.create({
					sender: this.user,
					sender_client_id: opts.client_id,
					receiver: message.number,
					message: message.message ?? '',
					attachments: message.attachments ?? [],
					shared_contact_cards: message.shared_contact_cards ?? [],
					polls: message.polls ?? [],
					sendAt: message.send_at,
					batch_id: batch_id,
					campaign_name: 'LEAD_NURTURING',
					campaign_id: 'LEAD_NURTURING',
					campaign_created_at: time_now.toDate(),
				})
			);
		}

		return await Promise.all(docPromise);
	}

	static async sendScheduledMessage() {
		const scheduledMessages = await ScheduledMessageDB.find({
			sendAt: { $lte: DateUtils.getMomentNow().toDate() },
			isSent: false,
			isFailed: false,
			isPaused: false,
		}).populate('attachments sender shared_contact_cards');

		scheduledMessages.forEach(async (scheduledMessage) => {
			const whatsapp = WhatsappProvider.getInstance(scheduledMessage.sender_client_id);

			const userService = new UserService(scheduledMessage.sender);
			const { isSubscribed, isNew } = userService.isSubscribed();

			if (!whatsapp.isReady() || (!isSubscribed && !isNew)) {
				scheduledMessage.isFailed = true;
				scheduledMessage.save();
				return null;
			}
			let msg = scheduledMessage.message;

			if (msg) {
				whatsapp
					.getClient()
					.sendMessage(scheduledMessage.receiver, msg)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			}

			scheduledMessage.shared_contact_cards.forEach(async (card) => {
				whatsapp
					.getClient()
					.sendMessage(scheduledMessage.receiver, card.vCardString)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			});

			scheduledMessage.attachments.forEach(async (attachment) => {
				const { filename, caption, name } = attachment;
				const path = __basedir + ATTACHMENTS_PATH + filename;
				if (!fs.existsSync(path)) {
					return null;
				}

				const media = MessageMedia.fromFilePath(path);
				if (name) {
					media.filename = name + path.substring(path.lastIndexOf('.'));
				}
				whatsapp
					.getClient()
					.sendMessage(scheduledMessage.receiver, media, {
						caption,
					})
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			});

			scheduledMessage.polls.forEach(async (poll) => {
				const { title, options, isMultiSelect } = poll;
				whatsapp
					.getClient()
					.sendMessage(
						scheduledMessage.receiver,
						new Poll(title, options, {
							allowMultipleAnswers: isMultiSelect,
						})
					)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			});

			if (
				scheduledMessage.shared_contact_cards &&
				scheduledMessage.shared_contact_cards.length > 0
			) {
				whatsapp
					.getClient()
					.sendMessage(scheduledMessage.receiver, PROMOTIONAL_MESSAGE_2)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			} else if (!isSubscribed && isNew) {
				whatsapp
					.getClient()
					.sendMessage(scheduledMessage.receiver, PROMOTIONAL_MESSAGE_1)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			}

			scheduledMessage.isSent = true;
			scheduledMessage.save();
		});
	}

	async allCampaigns() {
		const messages = await ScheduledMessageDB.aggregate([
			{ $match: { sender: this.user._id, campaign_id: { $exists: true } } },
			{
				$group: {
					_id: '$campaign_id', // Group by campaign_id
					campaignName: { $first: '$campaign_name' }, // Get the first campaign_name
					campaign_created_at: { $first: '$campaign_created_at' }, // Get the first campaign_name
					sent: { $sum: { $cond: ['$isSent', 1, 0] } }, // Count isSent = true
					failed: { $sum: { $cond: ['$isFailed', 1, 0] } }, // Count isFailed = true
					pending: {
						$sum: {
							$cond: [{ $and: [{ $eq: ['$isSent', false] }, { $eq: ['$isFailed', false] }] }, 1, 0],
						},
					},
					isPaused: {
						$max: {
							$cond: {
								if: { $eq: ['$isPaused', true] },
								then: true,
								else: false,
							},
						},
					},
				},
			},
			{
				$project: {
					campaign_id: '$_id',
					_id: 0, // Keep the _id (campaign_id) field
					campaignName: 1,
					sent: 1,
					failed: 1,
					pending: 1,
					isPaused: 1,
					campaign_created_at: 1,
				},
			},
		]);

		const _messages = messages
			.sort((a, b) =>
				DateUtils.getMoment(a.campaign_created_at).isAfter(
					DateUtils.getMoment(b.campaign_created_at)
				)
					? -1
					: 1
			)
			.map((message) => ({
				campaign_id: message.campaign_id as string,
				campaignName: message.campaignName as string,
				sent: message.sent as number,
				failed: message.failed as number,
				pending: message.pending as number,
				createdAt: DateUtils.format(message.campaign_created_at) as string,
				isPaused: message.isPaused as boolean,
			}));
		return _messages;
	}

	async deleteCampaign(campaign_id: string) {
		try {
			await ScheduledMessageDB.deleteMany({ sender: this.user, campaign_id });
		} catch (err) {}
	}

	async pauseCampaign(campaign_id: string) {
		await ScheduledMessageDB.updateMany(
			{ sender: this.user, campaign_id, isSent: false },
			{ $set: { isPaused: true, pausedAt: DateUtils.getMomentNow().toDate() } }
		);
	}
	async resumeCampaign(campaign_id: string) {
		const campaigns = await ScheduledMessageDB.find({
			sender: this.user,
			campaign_id,
			isPaused: true,
		});
		campaigns.forEach((campaign) => {
			campaign.isPaused = false; // Resume the campaign by setting isPaused to false

			const pausedAt = DateUtils.getMoment(campaign.pausedAt);
			const sendAt = DateUtils.getMoment(campaign.sendAt);
			const timeDifference = DateUtils.getMomentNow().diff(pausedAt, 'seconds');

			sendAt.add(timeDifference, 'seconds');

			campaign.sendAt = sendAt.toDate();
			campaign.save();
		});
	}

	async generateReport(campaign_id: string) {
		const campaigns = await ScheduledMessageDB.find({ sender: this.user, campaign_id });

		return campaigns.map((campaign) => ({
			message: campaign.message,
			receiver: campaign.receiver.split('@')[0],
			attachments: campaign.attachments.length,
			contacts: campaign.shared_contact_cards.length,
			campaign_name: campaign.campaign_name,
			status: campaign.isSent
				? 'Sent'
				: campaign.isFailed
				? 'Failed'
				: campaign.isPaused
				? 'Paused'
				: 'Pending',
			scheduled_at: DateUtils.getMoment(campaign.sendAt).format('DD/MM/YYYY HH:mm:ss'),
		}));
	}

	async isAttachmentInUse(id: Types.ObjectId) {
		const attachment = await UploadDB.findById(id);
		if (!attachment) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		const campaigns: IScheduledMessage[] = await ScheduledMessageDB.aggregate([
			{
				$match: {
					attachments: {
						$elemMatch: {
							filename: attachment.filename,
						},
					},
					isSent: false,
					isFailed: false,
				},
			},
		]);
		return campaigns.length > 0;
	}
}
