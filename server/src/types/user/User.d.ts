import { Document } from 'mongoose';

export default interface IUser extends Document {
	phone: string;
	name: string;
	userType: 'BUSINESS' | 'PERSONAL';
	subscription_expiry: Date;
	business_details: {
		description: string;
		email: string;
		websites: string[];
		latitude: number;
		longitude: number;
		address: string;
	};
	createdAt: Date;
	updateAt: Date;
}
