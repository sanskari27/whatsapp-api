import { Document } from 'mongoose';
import { IUser } from '../users';
export default interface IGroupReply extends Document {
	user: IUser;
	from: string;
	createdAt: Date;
	updatedAt: Date;
}
