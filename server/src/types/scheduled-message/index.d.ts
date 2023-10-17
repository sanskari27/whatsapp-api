import { Document } from 'mongoose';
import { IUser } from '../users';
import { WALLET_TRANSACTION_STATUS } from '../../config/const';
import ICoupon from '../coupon';
import { IAuthDetail } from '../user';

export default interface IScheduledMessage extends Document {
	sender: IUser;
	sender_client_id: string;

	receiver: string;

	type: 'TEXT' | 'ATTACHMENT' | 'CONTACT_CARDS';

	message: string;

	attachment: string;
	caption: string;

	shared_contact_cards: string[];

	sendAt: Date;
	isSent: boolean;
	isFailed: boolean;

	batch_id?: string;
}
