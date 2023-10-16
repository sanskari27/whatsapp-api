import { Types } from 'mongoose';
import { IUser } from '../../../types/user';
import TemplateDB from '../../repository/template';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';

export default class TemplateService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	async listTemplates() {
		const templates = await TemplateDB.find({ user: this.user });
		return templates.map((template) => ({
			id: template._id as string,
			name: template.name,
			message: template.message,
		}));
	}

	addTemplate(name: string, message: string) {
		const template = new TemplateDB({ user: this.user, name, message });
		template.save();
		return {
			id: template._id as string,
			name: template.name,
			message: template.message,
		};
	}

	async deleteTemplate(id: Types.ObjectId) {
		const template = await TemplateDB.findById(id);
		if (!template) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		template.remove();
	}

	async updateTemplate(id: Types.ObjectId, name: string, message: string) {
		const template = await TemplateDB.findOne({ user: this.user, _id: id });
		if (!template) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		template.name = name;
		template.message = message;
		template.save();
		return {
			id: template._id,
			name: template.name,
			message: template.message,
		};
	}
}
