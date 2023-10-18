import mongoose, { Schema } from 'mongoose';
import IBot from '../../../types/bot/Bot';
import { BOT_TRIGGER_OPTIONS } from '../../../config/const';

const botSchema = new mongoose.Schema<IBot>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	respond_to_all: {
		type: Boolean,
		default: false,
	},
	respond_to_recipients: [
		{
			type: String,
			default: [],
		},
	],
	trigger: {
		type: String,
	},
	trigger_gap_seconds: {
		type: Number,
	},
	options: {
		type: String,
		enum: Object.values(BOT_TRIGGER_OPTIONS),
	},
	message: String,
	attachments: [
		{
			filename: String,
			caption: String,
		},
	],
	shared_contact_cards: [String],

	active: {
		type: Boolean,
		default: true,
	},
});

const BotDB = mongoose.model<IBot>('Bot', botSchema);

export default BotDB;
