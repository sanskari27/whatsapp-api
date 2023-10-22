import mongoose, { Schema } from 'mongoose';
import { TAX, WALLET_TRANSACTION_STATUS } from '../../../config/const';
import IPayment from '../../../types/payment';
import DateUtils from '../../../utils/DateUtils';

const paymentSchema = new mongoose.Schema<IPayment>({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
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
	expires_at: {
		type: Date,
		required: true,
		default: Date.now,
	},
	reference_id: {
		type: String,
	},
	transaction_status: {
		type: String,
		enum: Object.values(WALLET_TRANSACTION_STATUS),
	},
	transaction_date: {
		type: Date,
		default: Date.now,
	},
});

paymentSchema.pre<IPayment>('save', function (next) {
	if (
		this.isModified('transaction_status') &&
		this.transaction_status === WALLET_TRANSACTION_STATUS.SUCCESS
	) {
		this.expires_at = DateUtils.getMomentNow().add(1, 'month').toDate();
	}

	this.tax = this.gross_amount * TAX;

	this.total_amount = this.gross_amount + this.tax - this.discount;

	next();
});

const PaymentDB = mongoose.model<IPayment>('Payment', paymentSchema);

export default PaymentDB;
