import { Document } from 'mongoose';
import { IUser } from '../users';
export default interface IMergedGroup extends Document {
	user: IUser;
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
