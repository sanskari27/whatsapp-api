import { Document } from 'mongoose';
import { IAccount } from '../account';

export default interface IShortner extends Document {
	_id: Types.ObjectId;
	user: IAccount;
	title: string;
	key: string;
	link: string;
	qrString: string;
}
