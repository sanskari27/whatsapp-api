import mongoose, { Schema } from 'mongoose';
import IPayment from '../../../types/payment/payment';

const paymentSchema = new mongoose.Schema<IPayment>({
	bucket: {
		type: Schema.Types.ObjectId,
		ref: 'PaymentBucket',
	},
	amount: Number,
	order_id: {
		type: String,
		unique: true,
	},
	payment_id: {
		type: String,
		unique: true,
	},
	transaction_date: {
		type: Date,
		default: Date.now,
	},
});

const PaymentDB = mongoose.model<IPayment>('Payment', paymentSchema);

export default PaymentDB;
