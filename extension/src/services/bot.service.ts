import APIInstance from '../config/APIInstance';

type BotDetails = {
	bot_id: string;
	respond_to: string;
	trigger: string;
	trigger_gap_seconds: number;
	options: string;
	message: string;
	attachments: {
		id: any;
		filename: string;
		caption: string | undefined;
	}[];
	shared_contact_cards: string[];
	isActive: boolean;
};

export default class BotService {
	static async createBot(data: {
		trigger: string;
		message: string;
		respond_to: string;
		trigger_gap_seconds: number;
		options: string;
		shared_contact_cards: string[];
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
			return response.bots as BotDetails[];
		} catch (err) {
			return [];
		}
	}

	static async deleteTemplate(id: string) {
		try {
			await APIInstance.delete(`/whatsapp/bot/${id}`);
			return true;
		} catch (err) {
			return false;
		}
	}
}
