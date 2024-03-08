import { Document } from 'mongoose';
import { IAccount, IWADevice } from '../account';
export default interface IGroupReply extends Document {
	_id: Types.ObjectId;
	user: IAccount;
	device: IWADevice;
	from: string;
	createdAt: Date;
	updatedAt: Date;
}
