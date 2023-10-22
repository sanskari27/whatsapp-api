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
		}));
	}

	addCSV(name: string, filename: string) {
		const csv_doc = new UploadDB({ user: this.user, name, filename, type: 'NUMBERS' });
		csv_doc.save();
		return {
			id: csv_doc._id as string,
			name: csv_doc.name,
			filename: csv_doc.filename,
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
			})),
			attachments,
		] as [{ id: string; caption: string; filename: string; name: string }[], IUpload[]];
	}
	addAttachment(name: string, caption: string, filename: string) {
		const attachment = new UploadDB({
			user: this.user,
			name,
			filename,
			type: 'ATTACHMENT',
			caption,
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
