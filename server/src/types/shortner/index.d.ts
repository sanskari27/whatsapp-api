import { Document } from 'mongoose';
import { IUser } from '../user';

export default interface IShortner extends Document {
	user: IUser;
	title: string;
	key: string;
	link: string;
	qrString: string;
}
