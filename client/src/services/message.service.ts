import APIInstance from '../config/APIInstance';
import { SchedulerDetails } from '../store/types/SchedulerState';

type Scheduler = {
	id: string;
	devices: string[];
	name: string;
	description: string;
	message: string;
	attachments: string[];
	contacts: string[];
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];
	isActive: boolean;
	startAt: string;
	endAt: string;
	csv: string;
};

export default class MessageService {
	static async scheduleCampaign(data: {
		type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
		numbers?: string[];
		csv_file?: string;
		group_ids?: string[];
		label_ids?: string[];
		message?: string;
		variables?: string[];
		contacts?: string[];
		attachments?: string[];
		name: string;
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
		} catch (err: unknown) {
			//ignored
		}
	}
	static async createDailyMessenger(details: Omit<SchedulerDetails, 'id' | 'isActive'>) {
		try {
			const response = await APIInstance.post(`/scheduler`, details);
			return {
				id: response.data.scheduler.id ?? '',
				devices: response.data.scheduler.devices ?? [],
				name: response.data.scheduler.name ?? '',
				message: response.data.scheduler.message ?? '',
				attachments: response.data.scheduler.attachments ?? [],
				contacts: response.data.scheduler.contacts ?? [],
				polls: response.data.scheduler.polls ?? [],
				isActive: response.data.scheduler.isActive,
				startAt: response.data.scheduler.startAt ?? '',
				endAt: response.data.scheduler.endAt ?? '',
				csv: response.data.csv ?? '',
			} as Scheduler;
		} catch (err: unknown) {
			return null;
		}
	}

	static async getDailyMessenger() {
		try {
			const { data } = await APIInstance.get('/scheduler');
			return (data.schedulers as Scheduler[]).map((scheduler) => ({
				id: scheduler.id ?? '',
				devices: scheduler.devices ?? [],
				name: scheduler.name ?? '',
				description: scheduler.description ?? '',
				message: scheduler.message ?? '',
				attachments: scheduler.attachments ?? [],
				contacts: scheduler.contacts ?? [],
				polls: scheduler.polls ?? [],
				isActive: scheduler.isActive,
				startAt: scheduler.startAt ?? '',
				endAt: scheduler.endAt ?? '',
				csv: scheduler.csv ?? '',
			}));
		} catch (err: unknown) {
			return [] as Scheduler[];
		}
	}

	static async generateDailyMessengerReport(id: string) {
		try {
			const response = await APIInstance.get(`/scheduler/${id}/report`, {
				responseType: 'blob',
			});

			const contentType = response.headers['content-type'];
			const blob = new Blob([response.data], { type: contentType });

			// Create a temporary link element
			const downloadLink = document.createElement('a');
			downloadLink.href = window.URL.createObjectURL(blob);

			const contentDispositionHeader = response.headers['content-disposition'];
			const fileNameMatch = contentDispositionHeader.match(/filename="(.+)"/);
			const fileName = fileNameMatch ? fileNameMatch[1] : 'download.csv';

			downloadLink.download = fileName; // Specify the filename

			// Append the link to the body and trigger the download
			document.body.appendChild(downloadLink);
			downloadLink.click();

			// Clean up - remove the link
			document.body.removeChild(downloadLink);
		} catch (err) {
			//ignore
		}
	}

	static async updateDailyMessenger(
		id: string,
		scheduledMessage: Omit<SchedulerDetails, 'isActive'>
	) {
		try {
			const { data } = await APIInstance.patch(`/scheduler/${id}`, scheduledMessage);
			return {
				id: data.scheduler.id ?? '',
				devices: data.scheduler.devices ?? [],
				name: data.scheduler.name ?? '',
				message: data.scheduler.message ?? '',
				attachments: data.scheduler.attachments ?? [],
				contacts: data.scheduler.contacts ?? [],
				polls: data.scheduler.polls ?? [],
				isActive: data.scheduler.isActive,
				startAt: data.scheduler.startAt ?? '',
				endAt: data.scheduler.endAt ?? '',
				csv: data.scheduler.csv ?? '',
			} as Scheduler;
		} catch (err) {
			return null;
		}
	}

	static async toggleDailyMessenger(id: string) {
		try {
			const { data } = await APIInstance.put(`/scheduler/${id}`);
			return {
				devices: data.scheduler.devices ?? [],
				id: data.scheduler.id ?? '',
				name: data.scheduler.name ?? '',
				message: data.scheduler.message ?? '',
				attachments: data.scheduler.attachments ?? [],
				contacts: data.scheduler.contacts ?? [],
				polls: data.scheduler.polls ?? [],
				isActive: data.scheduler.isActive,
				startAt: data.scheduler.startAt ?? '',
				endAt: data.scheduler.endAt ?? '',
				csv: data.scheduler.csv ?? '',
			} as Scheduler;
		} catch (err: unknown) {
			return null;
		}
	}

	static async deleteDailyMessenger(id: string) {
		try {
			const { data } = await APIInstance.delete(`/scheduler/${id}`);
			if (data.success) return true;
			else return false;
		} catch (err) {
			return 'Unable to delete scheduled message';
		}
	}
}
