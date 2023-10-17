import WAWebJS, { MessageMedia } from 'whatsapp-web.js';
import { ATTACHMENTS_PATH } from '../../../config/const';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { IUser } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';
import ScheduledMessageDB from '../../repository/scheduled-message';
import fs from 'fs';
import { generateBatchID } from '../../../utils/ExpressUtils';
import IScheduledMessage from '../../../types/scheduled-message';
import { Types } from 'mongoose';

type BaseMessage = {
	number: string;
	type: 'TEXT' | 'ATTACHMENT' | 'CONTACT_CARDS';
};

type TextMessage = {
	message: string;
	type: 'TEXT';
};

type AttachmentMessage = {
	attachment: string;
	caption: string;
	type: 'ATTACHMENT';
};
type ContactCardMessage = {
	shared_contact_cards: string[];
	type: 'CONTACT_CARDS';
};
type Delay = number;
type Batch = {
	delay: number;
	batch_size: number;
	startTime?: string;
	endTime?: string;
};

export type Message = BaseMessage & (TextMessage | AttachmentMessage | ContactCardMessage);

export default class MessageSchedulerService {
	private user: IUser;
	private client_id: string;

	public constructor(user: IUser, client_id: string) {
		this.user = user;
		this.client_id = client_id;
	}

	async scheduleDelay(messages: Message[], delay: Delay) {
		const docPromise = messages.map(async (message, index) =>
			ScheduledMessageDB.create({
				sender: this.user,
				sender_client_id: this.client_id,
				receiver: message.number,
				type: message.type,
				message: message.type === 'TEXT' ? message.message : '',
				attachment: message.type === 'ATTACHMENT' ? message.attachment : '',
				caption: message.type === 'ATTACHMENT' ? message.caption : '',
				shared_contact_cards: message.type === 'CONTACT_CARDS' ? message.shared_contact_cards : '',
				sendAt: DateUtils.getMomentNow()
					.add(delay * (index + 1), 'seconds')
					.toDate(),
			})
		);
		return await Promise.all(docPromise);
	}

	async scheduleBatch(messages: Message[], opts: Batch) {
		const docPromise: Promise<
			IScheduledMessage & {
				_id: Types.ObjectId;
			}
		>[] = [];

		const startMoment = opts.startTime ? DateUtils.getMoment(opts.startTime, 'HH:mm') : undefined;
		const endMoment = opts.endTime ? DateUtils.getMoment(opts.endTime, 'HH:mm') : undefined;
		const scheduledTime = DateUtils.getMomentNow();
		if (startMoment !== undefined && scheduledTime.isBefore(startMoment)) {
			scheduledTime
				.hours(startMoment.hours())
				.minutes(startMoment.minutes())
				.seconds(startMoment.seconds() + 1);
		}

		const no_of_batch = Math.ceil(messages.length / opts.batch_size);

		for (let batch_counter = 0; batch_counter < no_of_batch; batch_counter++) {
			const batch_id = generateBatchID();
			const _messages = messages.slice(
				batch_counter * opts.batch_size,
				Math.min((batch_counter + 1) * opts.batch_size)
			);
			scheduledTime.add(opts.delay, 'seconds');

			for (const message of _messages) {
				if (startMoment !== undefined && endMoment !== undefined) {
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
				}

				docPromise.push(
					ScheduledMessageDB.create({
						sender: this.user,
						sender_client_id: this.client_id,
						receiver: message.number,
						type: message.type,
						message: message.type === 'TEXT' ? message.message : '',
						attachment: message.type === 'ATTACHMENT' ? message.attachment : '',
						caption: message.type === 'ATTACHMENT' ? message.caption : '',
						shared_contact_cards:
							message.type === 'CONTACT_CARDS' ? message.shared_contact_cards : '',
						sendAt: scheduledTime.toDate(),
						batch_id: batch_id,
					})
				);
			}
		}

		return await Promise.all(docPromise);
	}

	static async sendScheduledMessage() {
		const scheduledMessages = await ScheduledMessageDB.find({
			sendAt: { $lte: DateUtils.getMomentNow().toDate() },
			isSent: false,
			isFailed: false,
		});

		scheduledMessages.forEach(async (scheduledMessage) => {
			const whatsapp = WhatsappProvider.getInstance(scheduledMessage.sender_client_id);
			if (!whatsapp.isReady()) {
				scheduledMessage.isFailed = true;
				scheduledMessage.save();
				return null;
			}
			if (scheduledMessage.type === 'TEXT') {
				whatsapp.getClient().sendMessage(scheduledMessage.receiver, scheduledMessage.message);
			} else if (scheduledMessage.type === 'CONTACT_CARDS') {
				const contact_cards_promise = (scheduledMessage.shared_contact_cards ?? []).map(
					async (number) => {
						const id = await whatsapp.getClient().getNumberId(number);
						if (!id) {
							return null;
						}
						return await whatsapp.getClient().getContactById(id._serialized);
					}
				);
				Promise.all(contact_cards_promise).then((contact_cards) => {
					const non_empty_cards = contact_cards.filter(
						(card) => card !== null
					) as WAWebJS.Contact[];
					if (contact_cards.length > 0) {
						whatsapp.getClient().sendMessage(scheduledMessage.receiver, non_empty_cards);
					}
				});
			} else {
				const path = __basedir + ATTACHMENTS_PATH + scheduledMessage.attachment;
				if (!fs.existsSync(path)) {
					scheduledMessage.isFailed = true;
					scheduledMessage.save();
					return null;
				}
				const media = MessageMedia.fromFilePath(path);
				whatsapp.getClient().sendMessage(scheduledMessage.receiver, media, {
					caption: scheduledMessage.caption,
				});
			}
			scheduledMessage.isSent = true;
			scheduledMessage.save();
		});
	}
}
