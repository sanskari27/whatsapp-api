import { Document } from 'mongoose';
import IPaymentBucket from './payment-bucket';

export default interface IPayment extends Document {
	bucket: IPaymentBucket;
	amount: number;
	expires_at: Date;
	order_id: string;
	payment_id: string;
	transaction_date: Date;

	invoice_id: string;
	invoice_order_id: string;
	invoice_payment_id: string;
}
