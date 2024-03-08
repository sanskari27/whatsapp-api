import { Document } from 'mongoose';

export default interface IWADevice extends Document {
	_id: Types.ObjectId;
	phone: string;
	name: string;
	userType: 'BUSINESS' | 'PERSONAL';
	business_details: {
		description: string;
		email: string;
		websites: string[];
		latitude: number;
		longitude: number;
		address: string;
	};
	createdAt: Date;
}
