import { Document } from 'mongoose';
import { IUser } from '../users';

export default interface ICoupon extends Document {
	code: string;
	available_coupons: number;
	total_coupons: number;
	no_of_coupons_per_user: number;
	discount_percentage: number;
}
