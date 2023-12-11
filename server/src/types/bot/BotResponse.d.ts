import { Document } from 'mongoose';
import { IUser } from '../users';
import IBot from './Bot';

export default interface IBotResponse extends Document {
	user: IUser;
	recipient: string;
	bot: IBot;
	last_message: Date;
}
