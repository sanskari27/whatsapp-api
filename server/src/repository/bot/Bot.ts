import mongoose, { Schema } from 'mongoose';
import { BOT_TRIGGER_OPTIONS, BOT_TRIGGER_TO } from '../../config/const';
import IBot from '../../types/bot/Bot';

const botSchema = new mongoose.Schema<IBot>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	respond_to: {
		type: String,
		enum: Object.values(BOT_TRIGGER_TO),
		default: BOT_TRIGGER_TO.ALL,
	},
	trigger: {
		type: String,
	},
	trigger_gap_seconds: {
		type: Number,
	},
	response_delay_seconds: {
		type: Number,
	},
	options: {
		type: String,
		enum: Object.values(BOT_TRIGGER_OPTIONS),
	},
	message: String,
	attachments: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Upload',
		},
	],
	shared_contact_cards: [
		{
			type: Schema.Types.ObjectId,
			ref: 'ContactCard',
		},
	],
	group_respond: {
		type: Boolean,
		default: false,
	},
	polls: [
		{
			title: String,
			options: [String],
			isMultiSelect: Boolean,
		},
	],
	nurturing: [
		{
			message: String,
			after: Number,
			start_from: String,
			end_at: String,
		},
	],
	forward: {
		number: String,
		message: String,
	},
	active: {
		type: Boolean,
		default: true,
	},
});

const BotDB = mongoose.model<IBot>('Bot', botSchema);

export default BotDB;
