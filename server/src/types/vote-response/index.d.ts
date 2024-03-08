import { Document } from 'mongoose';
import { IAccount } from '../account';
export default interface IVoteResponse extends Document {
	_id: Types.ObjectId;
	user: IAccount;

	title: string;
	options: string[];
	isMultiSelect: boolean;

	chat_id: string;

	voter_number: string;
	voter_name: string;
	group_name: string;

	selected_option: string[];

	voted_at: Date;
}
