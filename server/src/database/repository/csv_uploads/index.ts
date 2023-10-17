import mongoose, { Schema } from 'mongoose';
import ICSVUpload from '../../../types/csv_uploads';

const csvUploadSchema = new mongoose.Schema<ICSVUpload>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	name: {
		type: String,
	},
	filename: {
		type: String,
	},
});

const CSVUploadDB = mongoose.model<ICSVUpload>('CSVUpload', csvUploadSchema);

export default CSVUploadDB;
