import { Document } from 'mongoose';
import { BILLING_PLANS_TYPE } from '../../config/const';

export default interface IPaymentBucket extends Document {
	phone_number: string;
	name: string;
	email: string;
	whatsapp_numbers: string[];
	plan_name: BILLING_PLANS_TYPE;
	billing_address: {
		street: string;
		city: string;
		district: string;
		state: string;
		country: string;
		pincode: string;
	};
}
