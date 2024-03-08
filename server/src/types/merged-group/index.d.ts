import { Document } from 'mongoose';
import { IWADevice } from '../account';
import { IUser } from '../users';
export default interface IMergedGroup extends Document {
	_id: Types.ObjectId;
	user: IUser;
	device: IWADevice;
	name: string;
	groups: string[];
	group_reply: {
		saved: string;
		unsaved: string;
	} | null;
	private_reply: {
		saved: string;
		unsaved: string;
	} | null;
}
