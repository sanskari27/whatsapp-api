import mongoose from 'mongoose';
import ICoupon from '../../../types/coupon';

const couponSchema = new mongoose.Schema<ICoupon>({
	code: {
		type: String,
		required: true,
	},
	offer_id: {
		type: String,
		unique: true,
		required: true,
	},
	plan: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Plan',
	},
	available_coupons: {
		type: Number,
		required: true,
	},
	total_coupons: {
		type: Number,
		required: true,
	},
	discount_percentage: {
		type: Number,
		required: true,
	},
});

couponSchema.pre<ICoupon>('save', function (next) {
	if (this.isNew) {
		this.available_coupons = this.total_coupons;
	}
	next();
});

const CouponDB = mongoose.model<ICoupon>('Coupon', couponSchema);

export default CouponDB;
