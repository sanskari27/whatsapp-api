import { Document } from 'mongoose';

export default interface ICoupon extends Document {
	code: string;
	available_coupons: number;
	total_coupons: number;
	discount_percentage: number;
}
