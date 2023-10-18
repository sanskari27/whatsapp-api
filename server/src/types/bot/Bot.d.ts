import { Document } from 'mongoose';
import { IUser } from '../users';
import { BOT_TRIGGER_OPTIONS } from '../../config/const';

export default interface IBot extends Document {
	user: IUser;

	respond_to_all: boolean;
	respond_to_recipients: string[];

	trigger: string;
	trigger_gap_seconds: number;

	options: BOT_TRIGGER_OPTIONS;

	message: string;
	attachments: {
		filename: string;
		caption: string;
	}[];
	shared_contact_cards: string[];

	active: boolean;
}
