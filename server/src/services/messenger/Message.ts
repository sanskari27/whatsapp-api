import fs from 'fs';
import { MessageMedia, Poll } from 'whatsapp-web.js';
import { ATTACHMENTS_PATH, MESSAGE_SCHEDULER_TYPE, MESSAGE_STATUS } from '../../config/const';
import { messageDB } from '../../config/postgres';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { TPoll } from '../../types/poll';
import DateUtils from '../../utils/DateUtils';
import { randomDevice } from '../../utils/ExpressUtils';
import { AccountService, AccountServiceFactory } from '../account';

export type Message = {
	receiver: string;
	message: TextMessage;
	attachments: {
		id: string;
		caption: string | undefined;
	}[];
	polls: TPoll[];
	contacts: string[];
	sendAt: Date;
};

type MessageSchedulerOptions = {
	scheduled_by: MESSAGE_SCHEDULER_TYPE;
	scheduler_id: string;
	devices: string[];
};

type TextMessage = string;

export default class MessageService {
	private _user: AccountService;

	public constructor(user: AccountService) {
		this._user = user;
	}

	async scheduleMessage(message: Message, opts: MessageSchedulerOptions) {
		const msg = await messageDB.create({
			data: {
				...message,
				username: this._user.username,
				recipient: message.receiver,
				devices: {
					connect: opts.devices.map((client_id) => ({ client_id })),
				},
				attachments: {
					connect: message.attachments.map(({ id }) => ({ id })),
				},
				contacts: {
					connect: message.contacts.map((id) => ({ id })),
				},
				captions: message.attachments.map((a) => a.caption ?? ''),
				scheduledBy: opts.scheduled_by,
				scheduledById: opts.scheduler_id,
			},
		});
		return msg.id;
	}

	async isAttachmentInUse(id: string) {
		const messages = await messageDB.count({
			where: {
				attachments: {
					some: { id },
				},
			},
		});

		return messages > 0;
	}

	async scheduleLeadNurturingMessage(messages: Message[], opts: MessageSchedulerOptions) {
		for (const message of messages) {
			await messageDB.create({
				data: {
					...message,
					username: this._user.username,
					recipient: message.receiver,
					devices: {
						connect: opts.devices.map((client_id) => ({ client_id })),
					},
					attachments: {
						connect: message.attachments.map(({ id }) => ({ id })),
					},
					contacts: {
						connect: message.contacts.map((id) => ({ id })),
					},
					captions: message.attachments.map((a) => a.caption ?? ''),
					scheduledBy: opts.scheduled_by,
					scheduledById: opts.scheduler_id,
				},
			});
		}
	}

	static async sendScheduledMessage() {
		const scheduledMessages = await messageDB.findMany({
			where: {
				sendAt: {
					lte: DateUtils.getMomentNow().toDate(),
				},
				status: 'PENDING',
			},
			include: {
				devices: true,
				attachments: true,
				contacts: true,
			},
		});

		scheduledMessages.forEach(async (msg) => {
			if (msg.devices.length === 0) {
				messageDB.update({
					where: { id: msg.id },
					data: { status: 'FAILED' },
				});
				return;
			}
			const cid = randomDevice(msg.devices).client_id;
			if (!cid) {
				messageDB.update({
					where: { id: msg.id },
					data: {
						sendAt: DateUtils.getMoment(msg.sendAt).add(5, 'minutes').toDate(),
					},
				});
				return;
			}
			const user = await AccountServiceFactory.findByUsername(msg.username);
			const whatsapp = WhatsappProvider.getInstance(user, cid);

			const { isSubscribed } = await user.isSubscribed();

			if (!isSubscribed) {
				messageDB.update({
					where: { id: msg.id },
					data: { status: 'FAILED' },
				});
				return;
			}
			let message = msg.message;
			msg.status = MESSAGE_STATUS.SENT;
			messageDB.update({
				where: { id: msg.id },
				data: { status: 'SENT' },
			});

			if (message) {
				whatsapp.getClient().sendMessage(msg.recipient, message);
			}
			msg.contacts.forEach(async (card) => {
				whatsapp.getClient().sendMessage(msg.recipient, card.vCardString);
			});

			msg.attachments.forEach(async (attachment, index) => {
				const { filename, name } = attachment;
				const caption = msg.captions.length <= index ? '' : msg.captions[index];
				const path = __basedir + ATTACHMENTS_PATH + filename;
				if (!fs.existsSync(path)) {
					return null;
				}

				const media = MessageMedia.fromFilePath(path);
				if (name) {
					media.filename = name + path.substring(path.lastIndexOf('.'));
				}
				whatsapp.getClient().sendMessage(msg.recipient, media, {
					caption,
				});
			});

			msg.polls.forEach(async (poll) => {
				const { title, options, isMultiSelect } = poll as unknown as TPoll;
				whatsapp.getClient().sendMessage(
					msg.recipient,
					new Poll(title, options, {
						allowMultipleAnswers: isMultiSelect,
					})
				);
			});
		});
	}
}
