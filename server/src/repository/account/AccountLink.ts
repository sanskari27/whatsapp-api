import mongoose, { Schema } from 'mongoose';
import { IAccountLink } from '../../types/account';

const schema = new Schema<IAccountLink>({
	account: {
		type: Schema.Types.ObjectId,
		ref: 'Account',
		required: true,
	},
	device: {
		type: Schema.Types.ObjectId,
		ref: 'WADevice',
		required: true,
	},
	client_id: {
		type: String,
		required: true,
	},
});

const AccountLinkDB = mongoose.model<IAccountLink>('AccountLink', schema);

export default AccountLinkDB;
