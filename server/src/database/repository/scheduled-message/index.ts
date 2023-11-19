import mongoose, { Schema } from 'mongoose';
import IScheduledMessage from '../../../types/scheduled-message';

const scheduledMessageSchema = new mongoose.Schema<IScheduledMessage>(
	{
		sender: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		sender_client_id: {
			type: String,
			required: true,
		},
		receiver: {
			type: String,
			required: true,
		},
		isSent: {
			type: Boolean,
			default: false,
		},
		isFailed: {
			type: Boolean,
			default: false,
		},
		message: String,
		attachments: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Upload',
			},
		],
		shared_contact_cards: [String],
		sendAt: Date,
		batch_id: String,
		campaign_id: String,
		campaign_name: String,
		isPaused: {
			type: Boolean,
			default: false,
		},
		pausedAt: Date,
	},
	{ timestamps: true }
);

const ScheduledMessageDB = mongoose.model<IScheduledMessage>(
	'ScheduledMessage',
	scheduledMessageSchema
);

export default ScheduledMessageDB;
