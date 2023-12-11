import mongoose, { Schema } from 'mongoose';
import IBotResponse from '../../../types/bot/BotResponse';

const botResponseSchema = new mongoose.Schema<IBotResponse>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	bot: {
		type: Schema.Types.ObjectId,
		ref: 'Bot',
		required: true,
	},
	recipient: {
		type: String,
		required: true,
	},
	last_message: {
		type: Date,
		default: Date.now,
		required: true,
	},
});

const BotResponseDB = mongoose.model<IBotResponse>('BotResponse', botResponseSchema);

export default BotResponseDB;
