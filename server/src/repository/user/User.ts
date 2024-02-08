import mongoose, { Schema } from 'mongoose';
import { IUser } from '../../types/user';

const userSchema = new Schema<IUser>(
	{
		phone: {
			type: String,
			required: true,
		},
		name: {
			type: String,
		},
		userType: {
			type: String,
		},
		subscription_expiry: Date,
		group_reply_message: String,
	},
	{ timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
