import { Document } from 'mongoose';
import { IUser } from '../user';

export default interface IShortner extends Document {
	user: IUser;
	key: string;
	link: string;
	qrString: string;
}
