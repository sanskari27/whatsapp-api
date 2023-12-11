import { Document } from 'mongoose';
import { IUser } from '../users';

export default interface IScheduledMessage extends Document {
	sender: IUser;
	sender_client_id: string;

	receiver: string;

	message: string;

	attachments: {
		name: string;
		filename: string;
		caption: string;
	}[];

	shared_contact_cards: string[];

	sendAt: Date;
	isSent: boolean;
	isFailed: boolean;

	batch_id: string;
	campaign_id: string;
	campaign_name: string;

	isPaused: boolean;
	pausedAt: Date;
	campaign_created_at: Date;
}
