import { Types } from 'mongoose';
import { IUser } from '../../../types/user';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import CSVUploadDB from '../../repository/csv_uploads';

export default class CSVUploadService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	async listCSVs() {
		const csv_docs = await CSVUploadDB.find({ user: this.user });
		return csv_docs.map((csv) => ({
			id: csv._id as string,
			name: csv.name,
			filename: csv.filename,
		}));
	}

	addCSV(name: string, filename: string) {
		const csv_doc = new CSVUploadDB({ user: this.user, name, filename });
		csv_doc.save();
		return {
			id: csv_doc._id as string,
			name: csv_doc.name,
			message: csv_doc.filename,
		};
	}

	async deleteCSV(id: Types.ObjectId) {
		const doc = await CSVUploadDB.findById(id);
		if (!doc) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		doc.remove();
		return doc.filename;
	}
}
