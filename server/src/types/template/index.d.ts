import { Document } from 'mongoose';
import { IUser } from '../user';

export default interface ITemplate extends Document {
	user: IUser;
	name: string;
	message: string;
}
