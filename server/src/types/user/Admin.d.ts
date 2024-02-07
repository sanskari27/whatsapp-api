import { Document } from 'mongoose';

export default interface IAdmin extends Document {
	username: string;
	password: string;
	client_id?: string;
	name: string;

	refreshTokens: string[];

	verifyPassword(password: string): Promise<boolean>;

	getSignedToken(): string;
	getRefreshToken(): string;
}
