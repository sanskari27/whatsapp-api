import mongoose, { Schema } from 'mongoose';
import IMergedGroup from '../../types/merged-group';

const mergedGroupSchema = new mongoose.Schema<IMergedGroup>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	name: String,
	groups: [String],
	group_reply: String,
});

const MergedGroupDB = mongoose.model<IMergedGroup>('MergedGroup', mergedGroupSchema);

export default MergedGroupDB;
