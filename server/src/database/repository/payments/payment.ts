import mongoose, { Schema } from 'mongoose';
import IPayment from '../../../types/payment/payment';
import { generateInvoiceID } from '../../../utils/ExpressUtils';

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
		sparse: true,
	},
	transaction_date: {
		type: Date,
		default: Date.now,
	},
	invoice_id: {
		type: String,
	},
});

paymentSchema.pre('save', function (next) {
	if (!this.invoice_id) {
		this.invoice_id = generateInvoiceID();
	}
	next();
});

const PaymentDB = mongoose.model<IPayment>('Payment', paymentSchema);

export default PaymentDB;
