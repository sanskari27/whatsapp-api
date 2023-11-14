import fs from 'fs';
import { Types } from 'mongoose';
import { MessageMedia } from 'whatsapp-web.js';
import { ATTACHMENTS_PATH, PROMOTIONAL_MESSAGE } from '../../../config/const';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import IScheduledMessage from '../../../types/scheduled-message';
import IUpload from '../../../types/uploads';
import { IUser } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';
import ErrorReporter from '../../../utils/ErrorReporter';
import { generateBatchID, getRandomNumber } from '../../../utils/ExpressUtils';
import ScheduledMessageDB from '../../repository/scheduled-message';
import UserService from '../user';

export type Message = {
	number: string;
	message: TextMessage;
	attachments: IUpload[];
	shared_contact_cards: ContactCardMessage;
};

type TextMessage = string;

type ContactCardMessage = string[];

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

	async scheduleBatch(messages: Message[], opts: Batch) {
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
					sendAt: scheduledTime.toDate(),
					batch_id: batch_id,
					campaign_name: opts.campaign_name,
					campaign_id: opts.campaign_id,
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
		}).populate('attachments');

		scheduledMessages.forEach(async (scheduledMessage) => {
			const whatsapp = WhatsappProvider.getInstance(scheduledMessage.sender_client_id);
			if (!whatsapp.isReady()) {
				scheduledMessage.isFailed = true;
				scheduledMessage.save();
				return null;
			}
			const userService = new UserService(scheduledMessage.sender);

			const { isSubscribed, isNew } = userService.isSubscribed();

			if (!isSubscribed && !isNew) {
				scheduledMessage.isFailed = true;
				scheduledMessage.save();
				return;
			}

			if (scheduledMessage.message) {
				whatsapp
					.getClient()
					.sendMessage(scheduledMessage.receiver, scheduledMessage.message)
					.catch((err) => {
						ErrorReporter.report(err);
					});
			}

			scheduledMessage.shared_contact_cards.forEach(async (card) => {
				whatsapp
					.getClient()
					.sendMessage(scheduledMessage.receiver, card)
					.catch((err) => {
						ErrorReporter.report(err);
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
						ErrorReporter.report(err);
					});;
			});

			if (isNew && !isSubscribed) {
				whatsapp
					.getClient()
					.sendMessage(scheduledMessage.receiver, PROMOTIONAL_MESSAGE)
					.catch((err) => {
						ErrorReporter.report(err);
					});;
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
				},
			},
			{
				$sort: {
					campaignName: 1, // Sort by campaignName in ascending order (1)
				},
			},
		]);

		return messages as {
			campaign_id: string;
			campaignName: string;
			sent: number;
			failed: number;
			pending: number;
		}[];
	}

	async pauseCampaign(campaign_id: string) {
		await ScheduledMessageDB.updateMany(
			{ sender: this.user, campaign_id },
			{ $set: { isPaused: true, pausedAt: DateUtils.getMomentNow().toDate() } }
		);
	}
	async resumeCampaign(campaign_id: string) {
		const campaigns = await ScheduledMessageDB.find({ sender: this.user, campaign_id });
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
}
