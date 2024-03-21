import { Document } from 'mongoose';
import IContactCard from '../contact-cards';
import IPolls from '../polls';
import IUpload from '../uploads';
import { IUser } from '../users';
export default interface IMergedGroup extends Document {
	user: IUser;
	name: string;
	groups: string[];
	group_reply_saved: {
		text: string;
		attachments?: IUpload[];
		shared_contact_cards?: IContactCard[];
		polls?: IPolls[];
	};
	group_reply_unsaved: {
		text: string;
		attachments?: IUpload[];
		shared_contact_cards?: IContactCard[];
		polls?: IPolls[];
	};
	private_reply_saved: {
		text: string;
		attachments?: IUpload[];
		shared_contact_cards?: IContactCard[];
		polls?: IPolls[];
	};
	private_reply_unsaved: {
		text: string;
		attachments?: IUpload[];
		shared_contact_cards?: IContactCard[];
		polls?: IPolls[];
	};
	restricted_numbers?: IUpload;
	reply_business_only: boolean;
	random_string: boolean;
	active: boolean;
	min_delay: number;
	max_delay: number;
}