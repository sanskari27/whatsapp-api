import { Document } from 'mongoose';
import { IAccount } from '../account';

export default interface ITemplate extends Document {
	_id: Types.ObjectId;
	user: IAccount;
	name: string;
	message: string;
	poll: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	};
	type: 'MESSAGE' | 'POLL';
}
