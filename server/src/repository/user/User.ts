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
		business_details: {
			description: String,
			email: String,
			websites: [String],
			latitude: Number,
			longitude: Number,
			address: String,
		},
		subscription_expiry: Date,
	},
	{ timestamps: true }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
