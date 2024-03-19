import mongoose, { Schema } from 'mongoose';
import IGroupPrivateReply from '../../types/group-reply';

const schema = new mongoose.Schema<IGroupPrivateReply>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		from: {
			type: String,
		},
		mergedGroup: {
			type: Schema.Types.ObjectId,
			ref: 'MergedGroup',
		},
		group_name: String,
	},
	{ timestamps: true }
);

schema.index({ user: 1, from: 1 }, { unique: true });

const GroupPrivateReplyDB = mongoose.model<IGroupPrivateReply>('GroupPrivateReply', schema);

export default GroupPrivateReplyDB;
