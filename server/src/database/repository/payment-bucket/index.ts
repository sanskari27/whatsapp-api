import mongoose from 'mongoose';
import { BILLING_PLANS_TYPE } from '../../../config/const';
import IPaymentBucket from '../../../types/payment-bucket';

const paymentBucketSchema = new mongoose.Schema<IPaymentBucket>({
	plan_name: {
		type: String,
		enum: Object.values(BILLING_PLANS_TYPE),
		required: true,
	},
	phone_number: {
		type: String,
		required: true,
	},
	name: String,
	email: String,
	whatsapp_numbers: [String],
	billing_address: {
		street: String,
		city: String,
		district: String,
		state: String,
		country: String,
		pincode: String,
	},
});

const PaymentBucketDB = mongoose.model<IPaymentBucket>('PaymentBucket', paymentBucketSchema);

export default PaymentBucketDB;
