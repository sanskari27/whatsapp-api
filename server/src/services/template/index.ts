import { templateDB } from '../../config/postgres';
import { TPoll } from '../../types/poll';
import { AccountService } from '../account';

export default class TemplateService {
	private _user: AccountService;

	public constructor(user: AccountService) {
		this._user = user;
	}

	async listMessageTemplates() {
		const templates = await templateDB.findMany({
			where: {
				username: this._user.username,
				type: 'MESSAGE',
			},
		});
		return templates.map((template) => ({
			id: template.id,
			name: template.name,
			message: template.message,
		}));
	}

	async addMessageTemplate(name: string, message: string) {
		const template = await templateDB.create({
			data: {
				username: this._user.username,
				name,
				message,
				type: 'MESSAGE',
			},
		});
		return {
			id: template.id as string,
			name: template.name,
			message: template.message,
		};
	}

	async deleteTemplate(id: string) {
		await templateDB.delete({ where: { id } });
	}

	async updateMessageTemplate(id: string, name: string, message: string) {
		const template = await templateDB.update({
			where: { id },
			data: {
				name,
				message,
			},
		});
		return {
			id: template.id,
			name: template.name,
			message: template.message,
		};
	}

	async listPollTemplates() {
		const templates = await templateDB.findMany({
			where: {
				username: this._user.username,
				type: 'POLL',
			},
		});
		return templates.map((template) => ({
			id: template.id as string,
			name: template.name,
			poll: template.poll as TPoll,
		}));
	}

	async addPollTemplate(
		name: string,
		poll: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}
	) {
		const template = await templateDB.create({
			data: {
				username: this._user.username,
				name,
				poll,
				type: 'POLL',
			},
		});
		return {
			id: template.id as string,
			name: template.name,
			poll: template.poll,
		};
	}

	async updatePollTemplate(
		id: string,
		name: string,
		poll: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}
	) {
		const template = await templateDB.update({
			where: { id },
			data: {
				name,
				poll,
			},
		});
		return {
			id: template.id,
			name: template.name,
			poll: template.poll as TPoll,
		};
	}
}
