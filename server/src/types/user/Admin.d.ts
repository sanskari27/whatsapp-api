import { Document } from 'mongoose';

export default interface IAdmin extends Document {
	_id: Types.ObjectId;
	username: string;
	password: string;
	client_id?: string;
	name: string;

	verifyPassword(password: string): Promise<boolean>;

	getSignedToken(): string;
	getRefreshToken(): string;
}
