import { Types } from 'mongoose';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import IUpload from '../../../types/uploads';
import { IUser } from '../../../types/user';
import UploadDB from '../../repository/uploads';

export default class UploadService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	async listCSVs() {
		const csv_docs = await UploadDB.find({ user: this.user, type: 'NUMBERS' });
		return csv_docs.map((csv) => ({
			id: csv._id as string,
			name: csv.name,
			filename: csv.filename,
			headers: csv.headers,
		}));
	}

	async addCSV(name: string, filename: string, headers: string[]) {
		const exists = await UploadDB.exists({ name, user: this.user, type: 'NUMBERS' });
		if (exists) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.ALREADY_EXISTS);
		}
		const csv_doc = new UploadDB({
			user: this.user,
			name,
			filename,
			type: 'NUMBERS',
			headers,
		});
		csv_doc.save();
		return {
			id: csv_doc._id as string,
			name: csv_doc.name,
			filename: csv_doc.filename,
			headers: csv_doc.headers,
		};
	}

	async deleteCSV(id: Types.ObjectId) {
		const doc = await UploadDB.findById(id);
		if (!doc) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		doc.remove();
		return doc.filename;
	}

	async listAttachments(ids?: Types.ObjectId[]) {
		const attachments = await UploadDB.find({
			user: this.user,
			type: 'ATTACHMENT',
			...(ids ? { _id: { $in: ids } } : {}),
		});
		return [
			attachments.map((attachment) => ({
				id: attachment._id as string,
				caption: attachment.caption,
				filename: attachment.filename,
				name: attachment.name ?? '',
				custom_caption: attachment.custom_caption ?? false,
			})),
			attachments,
		] as [{ id: string; caption: string; filename: string; name: string }[], IUpload[]];
	}
	addAttachment(name: string, caption: string, filename: string, custom_caption: boolean = false) {
		const attachment = new UploadDB({
			user: this.user,
			name,
			filename,
			type: 'ATTACHMENT',
			caption,
			custom_caption,
		});
		attachment.save();
		return {
			id: attachment._id as string,
			name: attachment.name,
			filename: attachment.filename,
			caption: attachment.caption,
		};
	}
}
