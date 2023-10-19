import { Document } from 'mongoose';
import { WALLET_TRANSACTION_STATUS } from '../../config/const';
import ICoupon from '../coupon';
import IUpload from '../uploads';
import { IAuthDetail } from '../user';
import { IUser } from '../users';

export default interface IScheduledMessage extends Document {
	sender: IUser;
	sender_client_id: string;

	receiver: string;

	message: string;

	attachments: IUpload[];

	shared_contact_cards: string[];

	sendAt: Date;
	isSent: boolean;
	isFailed: boolean;

	batch_id: string;
	campaign_id: string;
	campaign_name: string;
}
