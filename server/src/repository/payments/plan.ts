import mongoose from 'mongoose';
import { BILLING_PLANS_TYPE } from '../../config/const';
import { IPlan } from '../../types/payment';

const planSchema = new mongoose.Schema<IPlan>({
	code: {
		type: String,
		required: true,
		unique: true,
		enum: Object.values(BILLING_PLANS_TYPE),
	},
	plan_id: {
		type: String,
		required: true,
		unique: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	user_count: {
		type: Number,
		required: true,
	},
	months: {
		type: Number,
		required: true,
		default: 1,
	},
});

const PlanDB = mongoose.model<IPlan>('Plan', planSchema);

export default PlanDB;
