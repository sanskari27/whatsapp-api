import fs from 'fs';
import { MessageMedia, Poll } from 'whatsapp-web.js';
import { ATTACHMENTS_PATH, MESSAGE_SCHEDULER_TYPE } from '../../config/const';
import { messageDB } from '../../config/postgres';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { TPoll } from '../../types/poll';
import DateUtils from '../../utils/DateUtils';
import { randomDevice } from '../../utils/ExpressUtils';
import { AccountService } from '../account';

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
		const { receiver, attachments, contacts, ..._message } = message;
		const msg = await messageDB.create({
			data: {
				..._message,
				username: this._user.username,
				recipient: receiver,
				devices: {
					connect: opts.devices.map((client_id) => ({ client_id })),
				},
				attachments: {
					connect: attachments.map(({ id }) => ({ id })),
				},
				contacts: {
					connect: contacts.map((id) => ({ id })),
				},
				captions: attachments.map((a) => a.caption ?? ''),
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
			const { receiver, attachments, contacts, ..._message } = message;

			await messageDB.create({
				data: {
					..._message,
					username: this._user.username,
					recipient: receiver,
					devices: {
						connect: opts.devices.map((client_id) => ({ client_id })),
					},
					attachments: {
						connect: attachments.map(({ id }) => ({ id })),
					},
					contacts: {
						connect: contacts.map((id) => ({ id })),
					},
					captions: attachments.map((a) => a.caption ?? ''),
					scheduledBy: opts.scheduled_by,
					scheduledById: opts.scheduler_id,
				},
			});
		}
	}

	static async markExpiredMessagesFailed() {
		await messageDB.updateMany({
			where: {
				user: {
					subscription_expiry: {
						lt: DateUtils.getMomentNow().toDate(),
					},
				},
			},
			data: {
				status: 'FAILED',
			},
		});
	}

	static async sendScheduledMessage(done: () => void = () => {}) {
		const scheduledMessages = await messageDB.findMany({
			where: {
				sendAt: {
					lte: DateUtils.getMomentNow().toDate(),
				},
				user: {
					subscription_expiry: {
						gte: DateUtils.getMomentNow().toDate(),
					},
				},
				status: 'PENDING',
			},
			include: {
				devices: true,
				attachments: true,
				contacts: true,
			},
		});

		await messageDB.updateMany({
			where: {
				id: {
					in: scheduledMessages.map((m) => m.id),
				},
			},
			data: {
				status: 'SENT',
			},
		});
		done();

		scheduledMessages.forEach(async (msg) => {
			const cid = randomDevice(msg.devices);

			const whatsapp = WhatsappProvider.getInstanceByClientID(cid?.client_id ?? '');
			if (!whatsapp || !cid) {
				messageDB.update({
					where: { id: msg.id },
					data: { status: 'FAILED' },
				});
				return;
			} else if (!whatsapp.isReady()) {
				messageDB.update({
					where: { id: msg.id },
					data: {
						sendAt: DateUtils.getMoment(msg.sendAt).add(5, 'minutes').toDate(),
						status: 'PENDING',
					},
				});
				return;
			}
			messageDB.update({
				where: { id: msg.id },
				data: {
					sender: cid.phone,
				},
			});

			let message = msg.message;

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
