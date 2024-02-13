import { Document } from 'mongoose';
import { MESSAGE_STATUS } from '../../config/const';
import { IUser } from '../user';

export default interface IMessage extends Document {
	sender: IUser;
	receiver: string;
	message: string;
	status: MESSAGE_STATUS;
	shared_contact_cards: IContactCard[];
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];
	attachments: {
		name: string;
		filename: string;
		caption: string;
	}[];
	createdAt: Date;
	sendAt: Date;
}
