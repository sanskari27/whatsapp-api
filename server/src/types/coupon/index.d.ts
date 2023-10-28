import { Document } from 'mongoose';
import { IPlan } from '../payment';

export default interface ICoupon extends Document {
	code: string;
	offer_id: string;
	plan: IPlan;
	available_coupons: number;
	total_coupons: number;
	discount_percentage: number;
}
