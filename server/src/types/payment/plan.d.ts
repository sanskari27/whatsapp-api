import { Document } from 'mongoose';
import { BILLING_PLANS_TYPE } from '../../config/const';

export default interface IPlan extends Document {
	code: BILLING_PLANS_TYPE;
	plan_id: string;
	amount: number;
	months: number;
	user_count: number;
}
