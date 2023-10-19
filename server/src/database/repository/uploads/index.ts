import mongoose, { Schema } from 'mongoose';
import IUpload from '../../../types/uploads';

const uploadSchema = new mongoose.Schema<IUpload>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	filename: {
		type: String,
		required: true,
	},
	name: String,
	caption: String,
	type: {
		type: String,
		enum: ['ATTACHMENT', 'NUMBERS'],
	},
});

const UploadDB = mongoose.model<IUpload>('Upload', uploadSchema);

export default UploadDB;
