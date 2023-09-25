import { Document } from 'mongoose';
import { IUser } from '../users';
import { WALLET_TRANSACTION_STATUS } from '../../config/const';

export default interface IPayment extends Document {
	user: IUser;
	gross_amount: number;
	discount: number;
	total_amount: number;
	tax: number;
	expires_at: Date;
	reference_id: string;
	transaction_status: WALLET_TRANSACTION_STATUS;
	transaction_date: Date;
}
