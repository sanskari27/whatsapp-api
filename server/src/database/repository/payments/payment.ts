import mongoose, { Schema } from 'mongoose';
import converter from 'number-to-words';
import { INVOICE_PATH } from '../../../config/const';
import IPayment from '../../../types/payment/payment';
import DateUtils from '../../../utils/DateUtils';
import { generateInvoiceID } from '../../../utils/ExpressUtils';
import InvoiceGenerator, { IGSTBill, NonGSTBill, SGSTBill } from '../../../utils/InvoiceGenerator';
import { FileUtils } from '../../../utils/files';
import PaymentBucketDB from './payment-bucket';

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
	invoice_id: String,
});

paymentSchema.pre('save', async function (next) {
	if (!this.invoice_id) {
		const count = (await PaymentDB.countDocuments()) + 1;
		this.invoice_id = generateInvoiceID(count.toString());
	}
	const destination = __basedir + INVOICE_PATH + this._id + '.pdf';
	if (this.payment_id && !FileUtils.exists(destination)) {
		const bucket = await PaymentBucketDB.findById(this.bucket).populate('plan');
		if (!bucket) {
			return next();
		}
		const generator = new InvoiceGenerator(destination);
		generator.addHeader(this.invoice_id);
		generator.addBillingDetails({
			name: this.bucket.name,
			billing_address: {
				...bucket.billing_address,
			},
			payment_details: {
				invoice_date: DateUtils.getMoment(this.transaction_date).format('DD/MMM/YYYY'),
				order_id: this.order_id,
				payment_id: this.payment_id,
			},
		});

		generator.addProduct({
			id: '1',
			service: 'Whatsleads.in Subscription',
			plan: bucket.plan.code,
			sac: '997331',
			start: DateUtils.getMoment(this.transaction_date).format('DD/MMM/YYYY'),
			end: DateUtils.getMoment(this.transaction_date)
				.add(bucket.plan.months, 'months')
				.format('DD/MMM/YYYY'),
			qty: '1',
			rate: bucket.plan.amount.toFixed(2),
			amount: this.amount.toFixed(2),
		});

		let amountDetails = {
			discount: bucket.discount.toFixed(2),
			sub_total: (bucket.gross_amount - bucket.discount).toFixed(2),
			total: bucket.total_amount.toFixed(2),
			total_in_words: converter.toWords(bucket.total_amount),
			gst_bill: true,
			isIGST: false,
			igst: 0,
			sgst: 0,
			cgst: 0,
		};

		if (bucket.billing_address.country.toLowerCase() === 'india') {
			if (bucket.billing_address.state.toLowerCase() === 'delhi') {
				amountDetails.isIGST = true;
				amountDetails.igst = bucket.tax;
			} else {
				amountDetails.cgst = bucket.tax / 2;
				amountDetails.sgst = bucket.tax / 2;
			}
		} else {
			amountDetails.gst_bill = false;
		}
		generator.addAmountDetails(amountDetails as IGSTBill | SGSTBill | NonGSTBill);
		generator.addFooter({
			invoice_date: DateUtils.getMoment(this.transaction_date).format('DD/MMM/YYYY'),
		});
		await generator.build();
	}
	next();
});

const PaymentDB = mongoose.model<IPayment>('Payment', paymentSchema);

export default PaymentDB;
