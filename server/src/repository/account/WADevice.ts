import mongoose, { Schema } from 'mongoose';
import { IWADevice } from '../../types/account';

const schema = new Schema<IWADevice>(
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
	},
	{ timestamps: { createdAt: true } }
);

const WADeviceDB = mongoose.model<IWADevice>('WADevice', schema);

export default WADeviceDB;
