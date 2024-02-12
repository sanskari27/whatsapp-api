import mongoose, { Schema } from 'mongoose';
import IGroupReply from '../../types/group-reply';

const schema = new mongoose.Schema<IGroupReply>(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		from: {
			type: String,
		},
	},
	{ timestamps: true }
);

schema.index({ user: 1, from: 1 }, { unique: true });

const GroupReplyDB = mongoose.model<IGroupReply>('GroupReply', schema);

export default GroupReplyDB;
