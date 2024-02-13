import mongoose, { Schema } from 'mongoose';
import { MESSAGE_STATUS } from '../../config/const';
import { IMessage } from '../../types/messenger';

const messageSchema = new mongoose.Schema<IMessage>(
	{
		sender: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		receiver: {
			type: String,
			required: true,
		},
		message: {
			type: String,
			default: '',
		},
		status: {
			type: String,
			enum: Object.keys(MESSAGE_STATUS),
			required: true,
			default: MESSAGE_STATUS.PENDING,
		},
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
	},
	{ timestamps: true }
);

const MessageDB = mongoose.model<IMessage>('Message', messageSchema);

export default MessageDB;
