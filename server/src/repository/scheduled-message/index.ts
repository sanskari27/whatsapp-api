import mongoose, { Schema } from 'mongoose';
import IScheduledMessage from '../../types/scheduled-message';

const scheduledMessageSchema = new mongoose.Schema<IScheduledMessage>({
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
			name: String,
			filename: String,
			caption: String,
		},
	],
	shared_contact_cards: [
		{
			type: Schema.Types.ObjectId,
			ref: 'ContactCard',
		},
	],
	polls: [
		{
			title: String,
			options: [String],
			isMultiSelect: Boolean,
		},
	],
	sendAt: Date,
	batch_id: String,
	campaign_id: String,
	campaign_name: String,
	isPaused: {
		type: Boolean,
		default: false,
	},
	pausedAt: Date,
	campaign_created_at: Date,
});

const ScheduledMessageDB = mongoose.model<IScheduledMessage>(
	'ScheduledMessage',
	scheduledMessageSchema
);

export default ScheduledMessageDB;
