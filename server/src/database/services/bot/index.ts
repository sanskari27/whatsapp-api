import fs from 'fs';
import { Types } from 'mongoose';
import Logger from 'n23-logger';
import WAWebJS, { MessageMedia, Poll } from 'whatsapp-web.js';
import {
	ATTACHMENTS_PATH,
	BOT_TRIGGER_OPTIONS,
	BOT_TRIGGER_TO,
	PROMOTIONAL_MESSAGE_1,
	PROMOTIONAL_MESSAGE_2,
} from '../../../config/const';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import IUpload from '../../../types/uploads';
import { IUser } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';
import { Delay } from '../../../utils/ExpressUtils';
import { BotResponseDB } from '../../repository/bot';
import BotDB from '../../repository/bot/Bot';
import UserService from '../user';

export default class BotService {
	private user: IUser;
	private userService: UserService;
	private whatsapp: WhatsappProvider | undefined;

	public constructor(user: IUser) {
		this.user = user;
		this.userService = new UserService(user);
	}

	public attachWhatsappProvider(whatsapp_provider: WhatsappProvider) {
		this.whatsapp = whatsapp_provider;
	}

	public async allBots(active: boolean = false) {
		const bots = await BotDB.find({
			user: this.user,
			...(active !== undefined ? { active: true } : {}),
		}).populate('attachments');
		return bots.map((bot) => ({
			bot_id: bot._id as Types.ObjectId,
			respond_to: bot.respond_to,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			response_delay_seconds: bot.response_delay_seconds,
			options: bot.options,
			message: bot.message,
			attachments: bot.attachments.map((attachment) => ({
				id: attachment._id,
				name: attachment.name,
				filename: attachment.filename,
				caption: attachment.caption,
			})),
			polls: bot.polls.map((poll) => ({
				title: poll.title,
				options: poll.options,
				isMultiSelect: poll.isMultiSelect,
			})),
			shared_contact_cards: bot.shared_contact_cards,
			group_respond: bot.group_respond,
			isActive: bot.active,
		}));
	}

	public async boyByID(id: Types.ObjectId) {
		const bot = await BotDB.findById(id).populate('attachments');

		if (!bot) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		return {
			bot_id: bot._id as Types.ObjectId,
			respond_to: bot.respond_to,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			response_delay_seconds: bot.response_delay_seconds,
			options: bot.options,
			message: bot.message,
			attachments: bot.attachments.map((attachment) => ({
				id: attachment._id,
				name: attachment.name,
				filename: attachment.filename,
				caption: attachment.caption,
			})),
			polls: bot.polls.map((poll) => ({
				title: poll.title,
				options: poll.options,
				isMultiSelect: poll.isMultiSelect,
			})),
			shared_contact_cards: bot.shared_contact_cards,
			isActive: bot.active,
		};
	}

	private async activeBots() {
		return await this.allBots(true);
	}

	private async lastMessages(ids: Types.ObjectId[], recipient: string) {
		const responses = await BotResponseDB.find({
			user: this.user,
			recipient,
			bot: { $in: ids },
		});

		return responses.reduce(
			(acc, item) => {
				let diff = DateUtils.getMoment(item.last_message).diff(DateUtils.getMomentNow(), 'seconds');
				diff = Math.abs(diff);
				const bot_id = item.bot.toString();
				acc[bot_id] = acc[bot_id] ? Math.min(diff, acc[bot_id]) : diff;
				return acc;
			},
			{} as {
				[key: string]: number;
			}
		);
	}

	private async botsEngaged({
		message_from,
		message_body,
		contact,
	}: {
		message_from: string;
		message_body: string;
		contact: WAWebJS.Contact;
	}) {
		const bots = await this.activeBots();
		const last_messages = await this.lastMessages(
			bots.map((bot) => bot.bot_id),
			message_from
		);

		return bots.filter((bot) => {
			const is_recipient =
				bot.respond_to === BOT_TRIGGER_TO.ALL ||
				(bot.respond_to === BOT_TRIGGER_TO.SAVED_CONTACTS && contact.isMyContact) ||
				(bot.respond_to === BOT_TRIGGER_TO.NON_SAVED_CONTACTS && !contact.isMyContact);

			if (!is_recipient) {
				return false;
			}
			if (bot.trigger_gap_seconds > 0) {
				const last_message_time = last_messages[bot.bot_id.toString()];
				if (!isNaN(last_message_time) && last_message_time <= bot.trigger_gap_seconds) {
					return false;
				}
			}
			if (bot.trigger === '') {
				return true;
			}
			if (bot.options === BOT_TRIGGER_OPTIONS.EXACT_IGNORE_CASE) {
				return message_body.toLowerCase() === bot.trigger.toLowerCase();
			}
			if (bot.options === BOT_TRIGGER_OPTIONS.EXACT_MATCH_CASE) {
				return message_body === bot.trigger;
			}

			if (bot.options === BOT_TRIGGER_OPTIONS.INCLUDES_IGNORE_CASE) {
				const lowerCaseSentence = bot.trigger.toLowerCase();
				const lowerCaseParagraph = message_body.toLowerCase();

				// Split the paragraph into words
				const words_paragraph = lowerCaseParagraph.split(/\s+/);
				const sentence_paragraph = lowerCaseSentence.split(/\s+/);

				return words_paragraph.some(
					(_, index, arr) =>
						arr.slice(index, index + sentence_paragraph.length).join() === sentence_paragraph.join()
				);
			}
			if (bot.options === BOT_TRIGGER_OPTIONS.INCLUDES_MATCH_CASE) {
				const lowerCaseSentence = bot.trigger;
				const lowerCaseParagraph = message_body;

				// Split the paragraph into words
				const words_paragraph = lowerCaseParagraph.split(/\s+/);
				const sentence_paragraph = lowerCaseSentence.split(/\s+/);

				return words_paragraph.some(
					(_, index, arr) =>
						arr.slice(index, index + sentence_paragraph.length).join() === sentence_paragraph.join()
				);
			}

			return false;
		});
	}

	public async handleMessage(
		from: string,
		body: string,
		contact: WAWebJS.Contact,
		opts: {
			isGroup: boolean;
		} = {
			isGroup: false,
		}
	) {
		if (!this.whatsapp) {
			throw new Error('Whatsapp Provider not attached.');
		}

		const { isSubscribed, isNew } = this.userService.isSubscribed();
		if (!isSubscribed && !isNew) {
			return;
		}
		const message_from = from.split('@')[0];

		const botsEngaged = await this.botsEngaged({ message_body: body, message_from, contact });

		const whatsapp = this.whatsapp;

		botsEngaged.forEach(async (bot) => {
			if (!bot.group_respond && opts.isGroup) {
				return;
			}
			await Delay(bot.response_delay_seconds);
			this.responseSent(bot.bot_id, message_from);

			let msg = bot.message;
			if (msg) {
				whatsapp
					.getClient()
					.sendMessage(from, msg)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			}

			if (bot.shared_contact_cards && bot.shared_contact_cards.length > 0) {
				msg += '\n' + PROMOTIONAL_MESSAGE_2;
			} else if (!isSubscribed && isNew) {
				msg += '\n' + PROMOTIONAL_MESSAGE_1;
			}

			for (const mediaObject of bot.attachments) {
				const path = __basedir + ATTACHMENTS_PATH + mediaObject.filename;
				if (!fs.existsSync(path)) {
					continue;
				}
				const media = MessageMedia.fromFilePath(path);
				if (mediaObject.name) {
					media.filename = mediaObject.name + path.substring(path.lastIndexOf('.'));
				}
				whatsapp
					.getClient()
					.sendMessage(from, media, {
						caption: mediaObject.caption,
					})
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			}

			(bot.shared_contact_cards ?? []).forEach(async (card) => {
				whatsapp
					.getClient()
					.sendMessage(from, card)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			});

			(bot.polls ?? []).forEach(async (poll) => {
				const { title, options, isMultiSelect } = poll;
				whatsapp
					.getClient()
					.sendMessage(
						from,
						new Poll(title, options, {
							allowMultipleAnswers: isMultiSelect,
						})
					)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			});

			if (bot.shared_contact_cards && bot.shared_contact_cards.length > 0) {
				whatsapp
					.getClient()
					.sendMessage(from, PROMOTIONAL_MESSAGE_2)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			} else if (!isSubscribed && isNew) {
				whatsapp
					.getClient()
					.sendMessage(from, PROMOTIONAL_MESSAGE_1)
					.catch((err) => {
						Logger.error('Error sending message:', err);
					});
			}
		});
	}

	private async responseSent(bot_id: Types.ObjectId, message_from: string) {
		const bot_response = await BotResponseDB.findOne({
			user: this.user,
			recipient: message_from,
			bot: bot_id,
		});

		if (bot_response) {
			bot_response.last_message = DateUtils.getMomentNow().toDate();
			bot_response.triggered_at.push(bot_response.last_message);
			await bot_response.save();
		} else {
			await BotResponseDB.create({
				user: this.user,
				recipient: message_from,
				bot: bot_id,
				last_message: DateUtils.getMomentNow().toDate(),
				triggered_at: [DateUtils.getMomentNow().toDate()],
			});
		}
	}

	public createBot(data: {
		respond_to: BOT_TRIGGER_TO;
		trigger_gap_seconds: number;
		response_delay_seconds: number;
		options: BOT_TRIGGER_OPTIONS;
		trigger: string;
		message: string;
		shared_contact_cards: string[];
		attachments: IUpload[];
		group_respond: boolean;
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
	}) {
		const bot = new BotDB({
			...data,
			user: this.user,
		});

		bot.save();
		return {
			bot_id: bot._id as Types.ObjectId,
			respond_to: bot.respond_to,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			response_delay_seconds: bot.response_delay_seconds,
			options: bot.options,
			message: bot.message,
			attachments: data.attachments.map((attachment) => ({
				id: attachment._id,
				filename: attachment.filename,
				caption: attachment.caption,
			})),
			shared_contact_cards: bot.shared_contact_cards,
			polls: bot.polls,
			isActive: bot.active,
		};
	}

	public async modifyBot(
		id: Types.ObjectId,
		data: {
			respond_to?: BOT_TRIGGER_TO;
			trigger_gap_seconds?: number;
			response_delay_seconds?: number;
			options?: BOT_TRIGGER_OPTIONS;
			trigger?: string;
			message?: string;
			shared_contact_cards?: string[];
			attachments?: IUpload[];
			polls?: {
				title: string;
				options: string[];
				isMultiSelect: boolean;
			}[];
		}
	) {
		const bot = await BotDB.findById(id).populate('attachments');
		if (!bot) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		if (data.respond_to) {
			bot.respond_to = data.respond_to;
		}
		if (data.trigger) {
			bot.trigger = data.trigger;
		}
		if (data.respond_to) {
			bot.respond_to = data.respond_to;
		}
		if (data.trigger_gap_seconds) {
			bot.trigger_gap_seconds = data.trigger_gap_seconds;
		}
		if (data.response_delay_seconds) {
			bot.response_delay_seconds = data.response_delay_seconds;
		}
		if (data.options) {
			bot.options = data.options;
		}
		if (data.message) {
			bot.message = data.message;
		}
		if (data.attachments) {
			bot.attachments = data.attachments;
		}
		if (data.shared_contact_cards) {
			bot.shared_contact_cards = data.shared_contact_cards;
		}
		if (data.polls) {
			bot.polls = data.polls;
		}
		await bot.save();

		return {
			bot_id: bot._id as Types.ObjectId,
			respond_to: bot.respond_to,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			response_delay_seconds: bot.response_delay_seconds,
			options: bot.options,
			message: bot.message,
			attachments: bot.attachments.map((attachment) => ({
				id: attachment._id,
				filename: attachment.filename,
				caption: attachment.caption,
			})),
			shared_contact_cards: bot.shared_contact_cards,
			polls: bot.polls,
			isActive: bot.active,
			group_respond: bot.group_respond,
		};
	}

	public async toggleActive(bot_id: Types.ObjectId) {
		const bot = await BotDB.findById(bot_id).populate('attachments');
		if (!bot) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		bot.active = !bot.active;
		bot.save();
		return {
			bot_id: bot._id as Types.ObjectId,
			respond_to: bot.respond_to,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			response_delay_seconds: bot.response_delay_seconds,
			options: bot.options,
			message: bot.message,
			attachments: bot.attachments.map((attachment) => ({
				id: attachment._id,
				filename: attachment.filename,
				caption: attachment.caption,
			})),
			shared_contact_cards: bot.shared_contact_cards,
			isActive: bot.active,
		};
	}

	public async deleteBot(bot_id: Types.ObjectId) {
		await BotDB.deleteOne({ _id: bot_id });
		await BotResponseDB.deleteMany({ bot: bot_id });
	}
}
