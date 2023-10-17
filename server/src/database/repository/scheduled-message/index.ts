import mongoose, { Schema } from 'mongoose';
import IScheduledMessage from '../../../types/scheduled-message';

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
	type: {
		type: String,
		enum: ['TEXT', 'ATTACHMENT'],
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
	attachment: String,
	caption: String,
	sendAt: Date,
	batch_id: String,
});

const ScheduledMessageDB = mongoose.model<IScheduledMessage>(
	'ScheduledMessage',
	scheduledMessageSchema
);

export default ScheduledMessageDB;
