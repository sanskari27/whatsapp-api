import fs from 'fs';
import WAWebJS, { MessageMedia, Poll } from 'whatsapp-web.js';
import {
	ATTACHMENTS_PATH,
	BOT_TRIGGER_OPTIONS,
	BOT_TRIGGER_TO,
	MESSAGE_SCHEDULER_TYPE,
} from '../../config/const';
import { botResponseDB, botsDB, nurturingDB } from '../../config/postgres';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import TimeGenerator from '../../structures/TimeGenerator';
import { TPoll } from '../../types/poll';
import DateUtils from '../../utils/DateUtils';
import { Delay } from '../../utils/ExpressUtils';
import VCardBuilder from '../../utils/VCardBuilder';
import { AccountService } from '../account';
import { MessageService } from '../messenger';

type CreateBotProps = {
	devices: string[];
	respond_to: BOT_TRIGGER_TO;
	trigger_gap_seconds: number;
	response_delay_seconds: number;
	options: BOT_TRIGGER_OPTIONS;
	trigger: string;
	message: string;
	startAt: string;
	endAt: string;
	contacts: string[];
	attachments: string[];
	group_respond: boolean;
	polls: TPoll[];
	forward: {
		number: string;
		message: string;
	};
	nurturing: {
		message: string;
		after: number;
		startAt: string;
		endAt: string;
		contacts?: string[];
		attachments?: string[];
		polls?: TPoll[];
	}[];
};

export default class BotService {
	private messageSchedulerService: MessageService;
	private _user: AccountService;

	public constructor(_user: AccountService) {
		this._user = _user;
		this.messageSchedulerService = new MessageService(_user);
	}

	public async allBots() {
		const bots = await botsDB.findMany({
			where: { username: this._user.username },
			include: {
				devices: true,
				attachments: true,
				contacts: true,
				nurturing: {
					include: {
						attachments: true,
						contacts: true,
					},
				},
			},
		});

		return bots.map((bot) => ({
			bot_id: bot.id,
			devices: bot.devices,
			respond_to: bot.respond_to,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			response_delay_seconds: bot.response_delay_seconds,
			options: bot.options,
			message: bot.message,
			startAt: bot.startAt,
			endAt: bot.endAt,
			attachments: bot.attachments.map((attachment) => ({
				id: attachment.id,
				name: attachment.name,
				filename: attachment.filename,
				caption: attachment.caption,
			})),
			polls: bot.polls.map((_: unknown) => {
				const poll: TPoll = _ as TPoll;
				return {
					title: poll.title,
					options: poll.options,
					isMultiSelect: poll.isMultiSelect,
				};
			}),
			contacts: bot.contacts,
			nurturing: (bot.nurturing ?? []).map((el) => ({
				message: el.message,
				after: el.after,
				startAt: el.startAt,
				endAt: el.endAt,
				contacts: el.contacts,
				attachments: el.attachments,
				polls: (el.polls ?? []).map((_: unknown) => {
					const poll: TPoll = _ as TPoll;
					return {
						title: poll.title,
						options: poll.options,
						isMultiSelect: poll.isMultiSelect,
					};
				}),
			})),
			forward: { number: bot.forward_to_number, message: bot.forward_to_message },
			group_respond: bot.group_respond,
			isActive: bot.active,
		}));
	}

	public async boyByID(id: string) {
		const bot = await botsDB.findUnique({
			where: { id },
			include: {
				attachments: true,
				contacts: true,
				devices: true,
				nurturing: {
					include: {
						attachments: true,
						contacts: true,
					},
				},
			},
		});

		if (!bot) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		return {
			bot_id: bot.id,
			devices: bot.devices,
			respond_to: bot.respond_to,
			trigger: bot.trigger,
			trigger_gap_seconds: bot.trigger_gap_seconds,
			response_delay_seconds: bot.response_delay_seconds,
			options: bot.options,
			message: bot.message,
			startAt: bot.startAt,
			endAt: bot.endAt,
			contacts: bot.contacts.map((c) => c.id),
			attachments: bot.attachments.map((a) => a.id),
			polls: bot.polls.map((_: unknown) => {
				const poll: TPoll = _ as TPoll;
				return {
					title: poll.title,
					options: poll.options,
					isMultiSelect: poll.isMultiSelect,
				};
			}),
			nurturing: (bot.nurturing ?? []).map((el) => ({
				...el,
				contacts: el.contacts,
				attachments: el.attachments,
				polls: el.polls.map((_: unknown) => {
					const poll: TPoll = _ as TPoll;
					return {
						title: poll.title,
						options: poll.options,
						isMultiSelect: poll.isMultiSelect,
					};
				}),
			})),
			isActive: bot.active,
		};
	}

	private async activeBots() {
		const bots = await this.allBots();
		return bots.filter((bot) => bot.isActive);
	}

	private async lastMessages(ids: string[], recipient: string) {
		const responses = await botResponseDB.findMany({
			where: {
				username: this._user.username,
				recipient,
				botId: {
					in: ids,
				},
			},
			distinct: 'botId',
			orderBy: {
				triggeredAt: 'desc',
			},
		});

		return responses.reduce(
			(acc, item) => {
				let diff = DateUtils.getMoment(item.triggeredAt).diff(DateUtils.getMomentNow(), 'seconds');
				diff = Math.abs(diff);
				const bot_id = item.botId.toString();
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
		device,
	}: {
		message_from: string;
		message_body: string;
		device: string;
		contact: WAWebJS.Contact;
	}) {
		const bots = await this.activeBots();
		const last_messages = await this.lastMessages(
			bots.map((bot) => bot.bot_id),
			message_from
		);

		return bots.filter((bot) => {
			const is_recipient =
				bot.respond_to === 'ALL' ||
				(bot.respond_to === 'SAVED_CONTACTS' && contact.isMyContact) ||
				(bot.respond_to === 'NON_SAVED_CONTACTS' && !contact.isMyContact);

			if (!is_recipient) {
				return false;
			}

			if (bot.devices.findIndex((e) => e.client_id === device) === -1) {
				return false;
			}

			if (!DateUtils.isTimeBetween(bot.startAt, bot.endAt, DateUtils.getMomentNow())) {
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
		whatsapp: WAWebJS.Client,
		details: {
			sender: string;
			trigger_chat: string;
			client_id: string;
			body: string;
			contact: WAWebJS.Contact;
			isGroup?: boolean;
			fromPoll?: boolean;
		}
	) {
		const { isSubscribed } = this._user.isSubscribed();

		const message_from = details.trigger_chat.split('@')[0];

		if (!isSubscribed) {
			return;
		}

		const botsEngaged = await this.botsEngaged({
			message_body: details.body,
			message_from,
			contact: details.contact,
			device: details.client_id,
		});

		botsEngaged.forEach(async (bot) => {
			if (!bot.group_respond && details.isGroup) {
				return;
			}
			await Delay(bot.response_delay_seconds);
			this.responseSent(bot.bot_id, details.sender, message_from);

			let msg = bot.message;
			if (msg) {
				if (msg.includes('{{public_name}}')) {
					msg = msg.replace('{{public_name}}', details.contact.pushname);
				}
				whatsapp.sendMessage(details.trigger_chat, msg);
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
				whatsapp.sendMessage(details.trigger_chat, media, {
					caption: mediaObject.caption ?? '',
				});
			}

			(bot.contacts ?? []).forEach(async (card) => {
				whatsapp.sendMessage(details.trigger_chat, card.vCardString);
			});

			(bot.polls ?? []).forEach(async (poll) => {
				const { title, options, isMultiSelect } = poll;
				whatsapp.sendMessage(
					details.trigger_chat,
					new Poll(title, options, {
						allowMultipleAnswers: isMultiSelect,
					})
				);
			});

			if (bot.forward.number) {
				const vCardString = new VCardBuilder({})
					.setFirstName(details.contact.name ?? details.contact.pushname)
					.setContactPhone(`+${details.contact.id.user}`, details.contact.id.user)
					.build();

				whatsapp.sendMessage(bot.forward.number + '@c.us', vCardString);

				if (bot.forward.message) {
					const _variable = '{{public_name}}';
					const custom_message = bot.forward.message.replace(
						_variable,
						(details.contact.pushname || details.contact.name) ?? ''
					);
					whatsapp.sendMessage(bot.forward.number + '@c.us', custom_message);
				}
			}

			if (bot.nurturing.length > 0) {
				const dateGenerator = new TimeGenerator({
					min_delay: 1,
					max_delay: 1,
					batch_size: 1,
					batch_delay: 1,
				});
				const nurtured_messages = await Promise.all(
					bot.nurturing.map(async (el) => {
						const _variable = '{{public_name}}';
						const custom_message = el.message.replace(
							new RegExp(_variable, 'g'),
							(details.contact.pushname || details.contact.name) ?? ''
						);
						dateGenerator.setStartTime(el.startAt).setEndTime(el.endAt);
						const dateAt = dateGenerator.next(el.after).value;
						return {
							receiver: details.trigger_chat,
							message: custom_message,
							sendAt: dateAt,
							contacts: el.contacts.map((c) => c.id),
							polls: el.polls,
							attachments: el.attachments.map((el) => ({
								id: el.id,
								caption: el.caption ?? '',
							})),
						};
					})
				);
				this.messageSchedulerService.scheduleLeadNurturingMessage(nurtured_messages, {
					scheduled_by: MESSAGE_SCHEDULER_TYPE.BOT,
					scheduler_id: bot.bot_id,
					devices: bot.devices.map((d) => d.client_id),
				});
			}
		});
	}

	private async responseSent(
		bot_id: string,
		sender: string,
		message_from: string,
		opts: {
			fromPoll: boolean;
		} = {
			fromPoll: false,
		}
	) {
		await botResponseDB.create({
			data: {
				username: this._user.username,
				recipient: message_from,
				sender: sender,
				botId: bot_id,
				triggeredBy: opts.fromPoll ? 'POLL' : 'BOT',
			},
		});
	}

	public async createBot(data: CreateBotProps) {
		const { devices, attachments, contacts, nurturing, forward, ..._data } = data;

		const { id } = await botsDB.create({
			data: {
				..._data,
				username: this._user.username,
				devices: {
					connect: devices.map((id) => ({ client_id: id })),
				},
				attachments: {
					connect: attachments.map((id) => ({ id })),
				},
				contacts: {
					connect: contacts.map((id) => ({ id })),
				},
				...(forward && {
					forward_to_number: forward.number,
					forward_to_message: forward.message,
				}),
			},
		});

		for (let i = 0; i < nurturing.length; i++) {
			const item = nurturing[i];
			const { attachments, contacts, ..._nurturing } = item;
			await nurturingDB.create({
				data: {
					..._nurturing,
					attachments: {
						connect: (attachments ?? []).map((id) => ({ id })),
					},
					contacts: {
						connect: (contacts ?? []).map((id) => ({ id })),
					},
					botId: id,
				},
			});
		}

		return await this.boyByID(id);
	}

	public async modifyBot(id: string, data: Partial<CreateBotProps>) {
		const exists = await botsDB.findUnique({ where: { id }, include: { devices: true } });
		if (!exists) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		const { devices, attachments, contacts, nurturing, forward, ..._data } = data;

		await nurturingDB.deleteMany({ where: { botId: id } });
		if (nurturing !== undefined) {
			for (let i = 0; i < nurturing.length; i++) {
				const item = nurturing[i];
				const { attachments, contacts, ..._nurturing } = item;
				await nurturingDB.create({
					data: {
						..._nurturing,
						attachments: {
							connect: (attachments ?? []).map((id) => ({ id })),
						},
						contacts: {
							connect: (contacts ?? []).map((id) => ({ id })),
						},
						botId: id,
					},
				});
			}
		}

		await botsDB.update({
			where: { id },
			data: {
				..._data,
				devices: {
					set: (devices ?? []).map((id) => ({ client_id: id })),
				},
				contacts: {
					set: (contacts ?? []).map((id) => ({ id })),
				},
				attachments: {
					set: (attachments ?? []).map((id) => ({ id })),
				},
				...(forward && {
					forward_to_number: forward.number,
					forward_to_message: forward.message,
				}),
			},
			include: {
				devices: true,
				attachments: true,
				contacts: true,
				nurturing: {
					include: {
						attachments: true,
						contacts: true,
					},
				},
			},
		});
		return await this.boyByID(id);
	}

	public async toggleActive(id: string) {
		const exists = await botsDB.findUnique({ where: { id } });
		if (!exists) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		await botsDB.update({
			where: { id },
			data: {
				active: !exists.active,
			},
		});
		return await this.boyByID(id);
	}

	public async deleteBot(id: string) {
		await botsDB.delete({ where: { id } });
		await botResponseDB.deleteMany({ where: { botId: id } });
	}

	public async botResponses(id: string) {
		const responses = await botResponseDB.findMany({
			where: { botId: id },
			include: {
				bot: true,
			},
		});
		if (!responses) {
			return [];
		}
		const result: {
			trigger: string;
			sender: string;
			recipient: string;
			triggered_at: string;
			triggered_by: string;
		}[] = [];
		responses.forEach((response) => {
			result.push({
				trigger: response.bot.trigger,
				sender: response.sender,
				recipient: response.recipient,
				triggered_at: DateUtils.getMoment(response.triggeredAt).format('DD-MM-YYYY HH:mm:ss'),
				triggered_by: response.triggeredBy,
			});
		});
		return result;
	}
}
