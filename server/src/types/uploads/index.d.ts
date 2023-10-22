import { Document } from 'mongoose';
import { type } from 'os';
import { IUser } from '../user';

export default interface IUpload extends Document {
	user: IUser;
	name: string;
	filename: string;
	caption?: string;
	type: 'NUMBERS' | 'ATTACHMENT';
	headers: string[];
}
