import APIInstance from '../config/APIInstance';

export type BotDetails = {
	bot_id: string;
	respond_to: string;
	trigger: string;
	trigger_gap_seconds: number;
	response_delay_seconds: number;
	options: string;
	message: string;
	attachments: [];
	shared_contact_cards: string[];
	isActive: boolean;
};

export default class BotService {
	static async createBot(data: {
		trigger: string;
		message: string;
		respond_to: string;
		trigger_gap_seconds: number;
		response_delay_seconds: number;
		options: string;
		shared_contact_cards?: string[];
		attachments: string[];
	}) {
		try {
			const { data: response } = await APIInstance.post(`/whatsapp/bot`, data);
			return response.bot as BotDetails;
		} catch (err) {
			return null;
		}
	}

	static async toggleBot(id: string) {
		try {
			const { data: response } = await APIInstance.put(`/whatsapp/bot/${id}`);
			return response.bot as BotDetails;
		} catch (err) {
			return null;
		}
	}

	static async listBots() {
		try {
			const { data: response } = await APIInstance.get(`/whatsapp/bot`);
			return response.bots.map((item: BotDetails) => ({
				bot_id: item.bot_id,
				respond_to: item.respond_to,
				trigger: item.trigger ?? '',
				trigger_gap_seconds: item.trigger_gap_seconds ?? 0,
				response_delay_seconds: item.response_delay_seconds ?? 0,
				options: item.options,
				message: item.message ?? '',
				attachments: item.attachments ?? [],
				shared_contact_cards: item.shared_contact_cards ?? [],
				isActive: item.isActive ?? true,
			})) as BotDetails[];
		} catch (err) {
			return [];
		}
	}

	static async deleteBot(id: string) {
		try {
			await APIInstance.delete(`/whatsapp/bot/${id}`);
			return true;
		} catch (err) {
			return false;
		}
	}

	static async updateBot(
		id: string,
		data: {
			trigger: string;
			message: string;
			respond_to: string;
			trigger_gap_seconds: number;
			options: string;
			shared_contact_cards?: string[];
			attachments: string[];
		}
	) {
		try {
			const { data: response } = await APIInstance.patch(`/whatsapp/bot/${id}`, data);
			return {
				bot_id: response.bot.bot_id,
				respond_to: response.bot.respond_to,
				trigger: response.bot.trigger ?? '',
				trigger_gap_seconds: response.bot.trigger_gap_seconds ?? 0,
				response_delay_seconds: response.bot.response_delay_seconds ?? 0,
				options: response.bot.options,
				message: response.bot.message ?? '',
				attachments: response.bot.attachments ?? [],
				shared_contact_cards: response.bot.shared_contact_cards ?? [],
				isActive: response.bot.isActive ?? true,
			} as BotDetails;
		} catch (err) {
			return null;
		}
	}
}
