import { Document } from 'mongoose';
import IUser from './User';

export default interface IAuthDetail extends Document {
	user: IUser;
	client_id: string;
	last_active: Date;

	isRevoked: boolean;
	revoke_at: Date;
	session_cleared: boolean;
}
