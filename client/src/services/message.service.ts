import axios from 'axios';
import APIInstance from '../config/APIInstance';

export default class MessageService {
	static async scheduleCampaign(data: {
		type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
		numbers?: string[];
		csv_file?: string;
		group_ids?: string[];
		label_ids?: string[];
		message?: string;
		variables?: string[];
		shared_contact_cards?: string[];
		attachments?: string[];
		campaign_name: string;
		min_delay: number;
		max_delay: number;
		startTime?: string;
		endTime?: string;
		batch_delay?: number;
		batch_size?: number;
		description?: string;
	}) {
		const { csv_file, ...details } = data;
		try {
			await APIInstance.post(`/whatsapp/schedule-message`, {
				...details,
				...(csv_file ? { csv_file } : {}),
			});
			return null;
		} catch (err: unknown) {
			if (axios.isAxiosError(err)) {
				if (err.response?.data.title === 'ALREADY_EXISTS') return 'Campaign name already exists';
			}
			return 'Unable to schedule message';
		}
	}
	static async scheduleMessage(details: {
		csv: string;
		message: string;
		shared_contact_cards: string[];
		attachments: string[];
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
		title: string;
		start_from: string;
		end_at: string;
	}) {
		try {
			const response = await APIInstance.post(`/scheduler`, details);
			return {
				id: response.data.scheduler.id ?? '',
				title: response.data.scheduler.title ?? '',
				message: response.data.scheduler.message ?? '',
				attachments: response.data.scheduler.attachments ?? [],
				shared_contact_cards: response.data.scheduler.shared_contact_cards ?? [],
				polls: response.data.scheduler.polls ?? [],
				isActive: response.data.scheduler.isActive,
				start_from: response.data.scheduler.start_from ?? '',
				end_at: response.data.scheduler.end_at ?? '',
				csv: response.data.csv ?? '',
			} as {
				id: string;
				title: string;
				message: string;
				attachments: string[];
				shared_contact_cards: string[];
				polls: {
					title: string;
					options: string[];
					isMultiSelect: boolean;
				}[];
				isActive: boolean;
				start_from: string;
				end_at: string;
				csv: string;
			};
		} catch (err: unknown) {
			return {
				id: '',
				title: '',
				message: '',
				attachments: [],
				shared_contact_cards: [],
				polls: [],
				isActive: false,
				start_from: '',
				end_at: '',
				csv: '',
			};
		}
	}

	static async getScheduledMessages() {
		try {
			const { data } = await APIInstance.get('/scheduler');
			return data.schedulers.map((scheduler: any) => ({
				id: scheduler.id ?? '',
				title: scheduler.title ?? '',
				message: scheduler.message ?? '',
				attachments: scheduler.attachments ?? [],
				shared_contact_cards: scheduler.shared_contact_cards ?? [],
				polls: scheduler.polls ?? [],
				isActive: scheduler.isActive,
				start_from: scheduler.start_from ?? '',
				end_at: scheduler.end_at ?? '',
				csv: scheduler.csv ?? '',
			}));
		} catch (err: unknown) {
			return [];
		}
	}

	static async editScheduledMessage(scheduledMessage: {
		id: string;
		message: string;
		shared_contact_cards: string[];
		attachments: string[];
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
		title: string;
		start_from: string;
		end_at: string;
		csv: string;
	}) {
		try {
			const { data } = await APIInstance.patch(`/scheduler/${scheduledMessage.id}`, {
				csv: scheduledMessage.csv,
				message: scheduledMessage.message,
				shared_contact_cards: scheduledMessage.shared_contact_cards,
				attachments: scheduledMessage.attachments,
				polls: scheduledMessage.polls,
				title: scheduledMessage.title,
				start_from: scheduledMessage.start_from,
				end_at: scheduledMessage.end_at,
			});
			return {
				id: data.bot.id ?? '',
				title: data.bot.title ?? '',
				message: data.bot.message ?? '',
				attachments: data.bot.attachments ?? [],
				shared_contact_cards: data.bot.shared_contact_cards ?? [],
				polls: data.bot.polls ?? [],
				isActive: data.bot.isActive,
				start_from: data.bot.start_from ?? '',
				end_at: data.bot.end_at ?? '',
				csv: data.bot.csv ?? '',
			} as {
				id: string;
				title: string;
				message: string;
				attachments: string[];
				shared_contact_cards: string[];
				polls: {
					title: string;
					options: string[];
					isMultiSelect: boolean;
				}[];
				isActive: boolean;
				start_from: string;
				end_at: string;
				csv: string;
			};
		} catch (err) {
			return {
				id: '',
				title: '',
				message: '',
				attachments: [],
				shared_contact_cards: [],
				polls: [],
				isActive: false,
				start_from: '',
				end_at: '',
				csv: '',
			};
		}
	}

	static async toggleScheduledMessage(id: string) {
		try {
			const { data } = await APIInstance.put(`/scheduler/${id}`);
			return {
				id: data.scheduler.id ?? '',
				title: data.scheduler.title ?? '',
				message: data.scheduler.message ?? '',
				attachments: data.scheduler.attachments ?? [],
				shared_contact_cards: data.scheduler.shared_contact_cards ?? [],
				polls: data.scheduler.polls ?? [],
				isActive: data.scheduler.isActive,
				start_from: data.scheduler.start_from ?? '',
				end_at: data.scheduler.end_at ?? '',
				csv: data.scheduler.csv ?? '',
			} as {
				id: string;
				title: string;
				message: string;
				attachments: string[];
				shared_contact_cards: string[];
				polls: {
					title: string;
					options: string[];
					isMultiSelect: boolean;
				}[];
				isActive: boolean;
				start_from: string;
				end_at: string;
				csv: string;
			};
		} catch (err: unknown) {
			return {
				id: '',
				message: '',
				title: '',
				attachments: [],
				shared_contact_cards: [],
				polls: [],
				isActive: false,
				start_from: '',
				end_at: '',
				csv: '',
			};
		}
	}

	static async deleteScheduledMessage(id: string) {
		try {
			const { data } = await APIInstance.delete(`/scheduler/${id}`);
			if (data.success) return true;
			else return false;
		} catch (err) {
			return 'Unable to delete scheduled message';
		}
	}
}
