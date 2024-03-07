import { Document } from 'mongoose';
import { AccessLevel } from '../../config/const';

export default interface IAccount extends Document {
	username: string;
	password: string;
	name: string;
	phone: string;
	avatar: string;
	access_level: AccessLevel;

	max_devices: number;
	subscription_expiry: Date;

	verifyPassword(password: string): Promise<boolean>;
	getSignedToken(): string;
	getRefreshToken(): string;
}
