import { Document } from 'mongoose';

export default interface IUser extends Document {
	phone: string;
	name: string;
	userType: 'BUSINESS' | 'PERSONAL';
	subscription_expiry: Date;
	createdAt: Date;
	updateAt: Date;
	group_reply_message: string;
}
