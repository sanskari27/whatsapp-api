import mongoose, { Schema } from 'mongoose';
import { SUBSCRIPTION_STATUS } from '../../../config/const';
import { ISubscription } from '../../../types/payment';

const subscriptionSchema = new mongoose.Schema<ISubscription>({
	bucket: {
		type: Schema.Types.ObjectId,
		ref: 'PaymentBucket',
	},
	subscription_id: {
		type: String,
	},
	subscription_link: {
		type: String,
	},
	plan: {
		type: Schema.Types.ObjectId,
		ref: 'Plan',
	},
	coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
	total_count: Number,
	paid_count: Number,
	remaining_count: Number,

	subscription_status: {
		type: String,
		enum: Object.values(SUBSCRIPTION_STATUS),
	},
});

const SubscriptionDB = mongoose.model<ISubscription>('Subscription', subscriptionSchema);

export default SubscriptionDB;
