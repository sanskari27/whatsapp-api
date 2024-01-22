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
});

const TemplateDB = mongoose.model<ITemplate>('Template', TemplateSchema);

export default TemplateDB;
