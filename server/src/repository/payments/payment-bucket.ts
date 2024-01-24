import mongoose, { Schema } from 'mongoose';
import { TAX, TRANSACTION_STATUS } from '../../config/const';
import IPaymentBucket from '../../types/payment/payment-bucket';

const paymentBucketSchema = new mongoose.Schema<IPaymentBucket>({
	plan: {
		type: Schema.Types.ObjectId,
		ref: 'Plan',
	},
	phone_number: {
		type: String,
		required: true,
	},
	name: String,
	email: String,
	admin_number: String,
	whatsapp_numbers: [String],
	billing_address: {
		street: String,
		city: String,
		district: String,
		state: String,
		country: String,
		pincode: String,
		gstin: String,
	},

	type: {
		type: String,
		enum: ['subscription', 'one-time'],
		required: true,
		default: 'one-time',
	},

	gross_amount: {
		type: Number,
		required: true,
	},
	discount_coupon: {
		type: Schema.Types.ObjectId,
		ref: 'Coupon',
	},
	discount: {
		type: Number,
		required: true,
		default: 0,
	},
	total_amount: {
		type: Number,
		required: true,
		default: 0,
	},
	tax: {
		type: Number,
		required: true,
		default: 0,
	},
	transaction_status: {
		type: String,
		enum: Object.values(TRANSACTION_STATUS),
		default: TRANSACTION_STATUS.PENDING,
	},
});

paymentBucketSchema.pre<IPaymentBucket>('save', function (next) {
	this.tax = Math.round(((this.gross_amount - this.discount) * TAX + Number.EPSILON) * 100) / 100;
	this.total_amount = this.gross_amount + this.tax - this.discount;

	next();
});

const PaymentBucketDB = mongoose.model<IPaymentBucket>('PaymentBucket', paymentBucketSchema);

export default PaymentBucketDB;
