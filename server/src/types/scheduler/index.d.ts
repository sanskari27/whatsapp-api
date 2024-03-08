import { Document } from 'mongoose';
import { IAccount, IWADevice } from '../account';
import IContactCard from '../contact-cards';
import IUpload from '../uploads';

export default interface IScheduler extends Document {
	_id: Types.ObjectId;
	user: IAccount;
	device: IWADevice;

	csv: IUpload;

	message: string;
	attachments: IUpload[];
	shared_contact_cards: IContactCard[];
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];

	active: boolean;

	title: string;
	description: string;
	start_from: string;
	end_at: string;
}
