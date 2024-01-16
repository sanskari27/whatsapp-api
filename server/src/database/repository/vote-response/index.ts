import mongoose, { Schema } from 'mongoose';
import IVoteResponse from '../../../types/vote-response';

const voteResponseSchema = new mongoose.Schema<IVoteResponse>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},

	title: String,
	options: [String],
	isMultiSelect: Boolean,

	chat_id: String,

	voter_number: String,
	voter_name: String,
	group_name: String,
	voted_at: Date,

	selected_option: [String],
});

voteResponseSchema.index(
	{ title: 1, options: 1, isMultiSelect: 1, chat_id: 1, voter_number: 1, user: 1 },
	{ unique: true }
);

const VoteResponseDB = mongoose.model<IVoteResponse>('VoteResponse', voteResponseSchema);

export default VoteResponseDB;
