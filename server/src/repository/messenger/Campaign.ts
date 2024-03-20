import mongoose, { Schema } from 'mongoose';
import { CAMPAIGN_STATUS } from '../../config/const';
import ICampaign from '../../types/messenger/campaign';

const campaignSchema = new mongoose.Schema<ICampaign>(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			default: '',
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		status: {
			type: String,
			enum: Object.keys(CAMPAIGN_STATUS),
			required: true,
			default: CAMPAIGN_STATUS.CREATED,
		},
		messages: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Message',
			},
		],
		random_string: Boolean,
		min_delay: Number,
		max_delay: Number,
		batch_size: Number,
		batch_delay: Number,
		startDate: String,
		startTime: String,
		endTime: String,
	},
	{ timestamps: true }
);

campaignSchema.index({ user: 1, name: 1 }, { unique: true });

const CampaignDB = mongoose.model<ICampaign>('Campaign', campaignSchema);

export default CampaignDB;
