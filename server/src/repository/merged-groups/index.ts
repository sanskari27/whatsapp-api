import mongoose, { Schema } from 'mongoose';
import IMergedGroup from '../../types/merged-group';

const mergedGroupSchema = new mongoose.Schema<IMergedGroup>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'Account',
	},
	device: {
		type: Schema.Types.ObjectId,
		ref: 'WADevice',
	},
	name: String,
	groups: [String],
	group_reply: {
		saved: String,
		unsaved: String,
	},
	private_reply: {
		saved: String,
		unsaved: String,
	},
});

const MergedGroupDB = mongoose.model<IMergedGroup>('MergedGroup', mergedGroupSchema);

export default MergedGroupDB;
