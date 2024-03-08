import { Document } from 'mongoose';
import { IAccount } from '../account';

export default interface IUpload extends Document {
	_id: Types.ObjectId;
	user: IAccount;
	name: string;
	filename: string;
	caption?: string;
	custom_caption: boolean;
	type: 'NUMBERS' | 'ATTACHMENT';
	headers: string[];
}
