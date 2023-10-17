import { Document } from 'mongoose';
import { IUser } from '../user';

export default interface ICSVUpload extends Document {
	user: IUser;
	name: string;
	filename: string;
}
