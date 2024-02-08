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
	}) {
		try {
			await APIInstance.post(`/whatsapp/schedule-message`, data);
			return null;
		} catch (err: any) {
			if (err.response.data.title === 'ALREADY_EXISTS') return 'Campaign name already exists';
			return 'Unable to schedule message';
		}
	}
	static async scheduleMessage(data: {
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
			const response = await APIInstance.post(`/scheduler`, data);
			console.log(response);
			return {
				id: response.data.scheduler.id ?? '',
				message: response.data.scheduler.message ?? '',
				attachments: response.data.scheduler.attachments ?? [],
				shared_contact_cards: response.data.scheduler.shared_contact_cards ?? [],
				polls: response.data.scheduler.polls ?? [],
				isActive: response.data.scheduler.isActive,
				start_from: response.data.scheduler.start_from ?? '',
				end_at: response.data.scheduler.end_at ?? '',
			} as {
				id: string;
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
			};
		} catch (err: any) {
			return {
				id: '',
				message: '',
				attachments: [],
				shared_contact_cards: [],
				polls: [],
				isActive: false,
				start_from: '',
				end_at: '',
			};
		}
	}

	static async getScheduledMessages() {
		try {
			const { data } = await APIInstance.get('/scheduler');
			return data.schedulers.map((scheduler: any) => ({
				id: scheduler.id ?? '',
				message: scheduler.message ?? '',
				attachments: scheduler.attachments ?? [],
				shared_contact_cards: scheduler.shared_contact_cards ?? [],
				polls: scheduler.polls ?? [],
				isActive: scheduler.isActive,
				start_from: scheduler.start_from ?? '',
				end_at: scheduler.end_at ?? '',
			}));
		} catch (err: any) {
			return [];
		}
	}

	static async toggleScheduledMessage(id: string) {
		try {
			const { data } = await APIInstance.put(`/scheduler/${id}`);
			return {
				id: data.scheduler.id ?? '',
				message: data.scheduler.message ?? '',
				attachments: data.scheduler.attachments ?? [],
				shared_contact_cards: data.scheduler.shared_contact_cards ?? [],
				polls: data.scheduler.polls ?? [],
				isActive: data.scheduler.isActive,
				start_from: data.scheduler.start_from ?? '',
				end_at: data.scheduler.end_at ?? '',
			} as {
				id: string;
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
			};
		} catch (err) {
			return {
				id: '',
				message: '',
				attachments: [],
				shared_contact_cards: [],
				polls: [],
				isActive: false,
				start_from: '',
				end_at: '',
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
