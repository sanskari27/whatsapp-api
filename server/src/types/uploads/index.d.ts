import { Document } from 'mongoose';
import { IUser } from '../user';

export default interface IUpload extends Document {
	user: IUser;
	name: string;
	filename: string;
	caption?: string;
	custom_caption: boolean;
	type: 'NUMBERS' | 'ATTACHMENT';
	headers: string[];
}
