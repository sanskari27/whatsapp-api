import { Document } from 'mongoose';
import { IUser } from '../users';
import IContactCard from '../contact-cards';

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

	shared_contact_cards: IContactCard[];

	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];

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
