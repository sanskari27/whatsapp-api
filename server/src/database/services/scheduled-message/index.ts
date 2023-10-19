import fs from 'fs';
import { Types } from 'mongoose';
import WAWebJS, { MessageMedia } from 'whatsapp-web.js';
import { ATTACHMENTS_PATH, PROMOTIONAL_MESSAGE } from '../../../config/const';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import IScheduledMessage from '../../../types/scheduled-message';
import IUpload from '../../../types/uploads';
import { IUser } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';
import { generateBatchID, getRandomNumber } from '../../../utils/ExpressUtils';
import ScheduledMessageDB from '../../repository/scheduled-message';
import PaymentService from '../payments';

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
};

export default class MessageSchedulerService {
	private user: IUser;
	private client_id: string;

	public constructor(user: IUser, client_id: string) {
		this.user = user;
		this.client_id = client_id;
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
					sender_client_id: this.client_id,
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
		}).populate('attachments');

		scheduledMessages.forEach(async (scheduledMessage) => {
			const whatsapp = WhatsappProvider.getInstance(scheduledMessage.sender_client_id);
			if (!whatsapp.isReady()) {
				scheduledMessage.isFailed = true;
				scheduledMessage.save();
				return null;
			}

			const { isSubscribed, isNew } = await new PaymentService(
				scheduledMessage.sender
			).canSendMessage();

			if (scheduledMessage.message) {
				whatsapp.getClient().sendMessage(scheduledMessage.receiver, scheduledMessage.message);
			}

			const contact_cards_promise = scheduledMessage.shared_contact_cards.map(async (number) => {
				const id = await whatsapp.getClient().getNumberId(number);
				if (!id) {
					return null;
				}
				return await whatsapp.getClient().getContactById(id._serialized);
			});
			Promise.all(contact_cards_promise).then((contact_cards) => {
				const non_empty_cards = contact_cards.filter((card) => card !== null) as WAWebJS.Contact[];
				if (contact_cards.length > 0) {
					whatsapp
						.getClient()
						.sendMessage(
							scheduledMessage.receiver,
							non_empty_cards.length > 1 ? non_empty_cards : non_empty_cards[0]
						);
				}
			});

			scheduledMessage.attachments.forEach(async (attachment) => {
				const { filename, caption } = attachment;
				const path = __basedir + ATTACHMENTS_PATH + filename;
				if (!fs.existsSync(path)) {
					return null;
				}

				const media = MessageMedia.fromFilePath(path);
				whatsapp.getClient().sendMessage(scheduledMessage.receiver, media, {
					caption,
				});
			});

			if (!isSubscribed && isNew) {
				whatsapp.getClient().sendMessage(scheduledMessage.receiver, PROMOTIONAL_MESSAGE);
			}

			scheduledMessage.isSent = true;
			scheduledMessage.save();
		});
	}
}
