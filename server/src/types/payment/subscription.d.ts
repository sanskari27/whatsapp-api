import { Document } from 'mongoose';
import ICoupon from '../coupon';
import IPaymentBucket from './payment-bucket';
import IPlan from './plan';

export default interface ISubscription extends Document {
	_id: Types.ObjectId;
	bucket: IPaymentBucket;
	subscription_id: string;
	subscription_link: string;

	plan: IPlan;
	coupon: ICoupon;

	total_count: number;
	paid_count: number;
	remaining_count: number;

	subscription_status: SUBSCRIPTION_STATUS;

	createdAt: Date;
}
