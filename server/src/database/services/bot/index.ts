import { IUser } from '../../../types/user';
import WAWebJS from 'whatsapp-web.js';
import BotDB from '../../repository/bot/Bot';
import { ATTACHMENTS_PATH, BOT_TRIGGER_OPTIONS, PROMOTIONAL_MESSAGE } from '../../../config/const';
import { Types } from 'mongoose';
import { BotResponseDB } from '../../repository/bot';
import DateUtils from '../../../utils/DateUtils';
import PaymentService from '../payments';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import fs from 'fs';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';

export default class BotService {
	private user: IUser;
	private paymentService: PaymentService;
	private whatsapp: WhatsappProvider | undefined;

	public constructor(user: IUser) {
		this.user = user;
		this.paymentService = new PaymentService(user);
	}

	public attachWhatsappProvider(whatsapp_provider: WhatsappProvider) {
		this.whatsapp = whatsapp_provider;
	}

	public async allBots() {
		const bots = await BotDB.find({
			user: this.user,
		});
		return bots.map((bot) => ({
			bot_id: bot._id as Types.ObjectId,
			respond_to_all: bot.respond_to_all,
			respond_to_recipients: bot.respond_to_recipients,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			options: bot.options,
			message: bot.message,
			attachments: bot.attachments,
			shared_contact_cards: bot.shared_contact_cards,
			isActive: bot.active,
		}));
	}
	private async activeBots() {
		const bots = await BotDB.find({
			user: this.user,
			active: true,
		});
		return bots.map((bot) => ({
			bot_id: bot._id as Types.ObjectId,
			respond_to_all: bot.respond_to_all,
			respond_to_recipients: bot.respond_to_recipients,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			options: bot.options,
			message: bot.message,
			attachments: bot.attachments,
			shared_contact_cards: bot.shared_contact_cards,
		}));
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
	}: {
		message_from: string;
		message_body: string;
	}) {
		const bots = await this.activeBots();
		const last_messages = await this.lastMessages(
			bots.map((bot) => bot.bot_id),
			message_from
		);

		return bots.filter((bot) => {
			const is_recipient = bot.respond_to_all || bot.respond_to_recipients.includes(message_from);

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
				return message_body.toLowerCase().split(' ').includes(bot.trigger.toLowerCase());
			}
			if (bot.options === BOT_TRIGGER_OPTIONS.INCLUDES_MATCH_CASE) {
				return message_body.split(' ').includes(bot.trigger);
			}

			return false;
		});
	}

	public async handleMessage(message: WAWebJS.Message) {
		if (!this.whatsapp) {
			throw new Error('Whatsapp Provider not attached.');
		}
		const message_from = message.from.split('@')[0];
		const message_body = message.body;

		const botsEngaged = await this.botsEngaged({ message_body, message_from });

		const { isSubscribed, isNew } = await this.paymentService.canSendMessage();
		const whatsapp = this.whatsapp;
		botsEngaged.forEach(async (bot) => {
			this.responseSent(bot.bot_id, message_from);

			if (bot.message.length > 0) {
				let formatted_message = bot.message;
				if (!isSubscribed && isNew) {
					formatted_message += PROMOTIONAL_MESSAGE;
				}
				whatsapp.getClient().sendMessage(message.from, formatted_message);
			}

			for (const mediaObject of bot.attachments) {
				const path = __basedir + ATTACHMENTS_PATH + mediaObject.filename;
				if (!fs.existsSync(path)) {
					continue;
				}
				whatsapp.getClient().sendMessage(message.from, path, {
					caption: mediaObject.caption,
				});
			}

			if (bot.shared_contact_cards.length > 0) {
				const contact_cards_promise = (bot.shared_contact_cards ?? []).map(async (number) => {
					const id = await whatsapp.getClient().getNumberId(number);
					if (!id) {
						return null;
					}
					return await whatsapp.getClient().getContactById(id._serialized);
				});
				Promise.all(contact_cards_promise).then((contact_cards) => {
					const cards = contact_cards.filter((card) => card !== null) as WAWebJS.Contact[];
					whatsapp.getClient().sendMessage(message.from, cards);
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
			await bot_response.save();
		} else {
			await BotResponseDB.create({
				user: this.user,
				recipient: message_from,
				bot: bot_id,
				last_message: DateUtils.getMomentNow().toDate(),
			});
		}
	}

	public createBot(data: {
		respond_to_all: boolean;
		respond_to_recipients: string[];
		trigger_gap_seconds: number;
		options: BOT_TRIGGER_OPTIONS;
		trigger: string;
		message: string;
		shared_contact_cards: string[];
		attachments: {
			filename: string;
			caption?: string;
		}[];
	}) {
		const bot = new BotDB({
			...data,
			user: this.user,
		});

		bot.save();
		return {
			bot_id: bot._id as Types.ObjectId,
			respond_to_all: bot.respond_to_all,
			respond_to_recipients: bot.respond_to_recipients,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			options: bot.options,
			message: bot.message,
			attachments: bot.attachments,
			shared_contact_cards: bot.shared_contact_cards,
			isActive: bot.active,
		};
	}

	public async toggleActive(bot_id: Types.ObjectId) {
		const bot = await BotDB.findById(bot_id);
		if (!bot) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		bot.active = !bot.active;
		bot.save();
		return {
			bot_id: bot._id as Types.ObjectId,
			respond_to_all: bot.respond_to_all,
			respond_to_recipients: bot.respond_to_recipients,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			options: bot.options,
			message: bot.message,
			attachments: bot.attachments,
			shared_contact_cards: bot.shared_contact_cards,
			isActive: bot.active,
		};
	}

	public async deleteBot(bot_id: Types.ObjectId) {
		await BotDB.deleteOne({ _id: bot_id });
		await BotResponseDB.deleteMany({ bot: bot_id });
	}
}
