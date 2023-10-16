import { Document } from 'mongoose';
import { IUser } from '../users';
import { WALLET_TRANSACTION_STATUS } from '../../config/const';
import ICoupon from '../coupon';
import { IAuthDetail } from '../user';

export default interface IScheduledMessage extends Document {
	sender: IUser;
	sender_client_id: string;

	receiver: string;

	type: 'TEXT' | 'ATTACHMENT';

	message: string;

	attachment: string;
	caption: string;

	sendAt: Date;
	isSent: boolean;

	batch_id?: string;
}
