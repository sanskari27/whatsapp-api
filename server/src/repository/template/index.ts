import mongoose, { Schema } from 'mongoose';
import ITemplate from '../../types/template';

const TemplateSchema = new mongoose.Schema<ITemplate>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	name: {
		type: String,
	},
	message: {
		type: String,
	},
	poll: {
		title: String,
		options: [String],
		isMultiSelect: Boolean,
	},
	type: {
		type: String,
		enum: ['MESSAGE', 'POLL'],
		default: 'MESSAGE',
	},
});

const TemplateDB = mongoose.model<ITemplate>('Template', TemplateSchema);

export default TemplateDB;
