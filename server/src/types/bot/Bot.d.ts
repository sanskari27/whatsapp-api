import { Document } from 'mongoose';
import { BOT_TRIGGER_OPTIONS, BOT_TRIGGER_TO } from '../../config/const';
import IUpload from '../uploads';
import { IUser } from '../users';

export default interface IBot extends Document {
	user: IUser;

	respond_to: BOT_TRIGGER_TO;

	trigger: string;
	trigger_gap_seconds: number;

	options: BOT_TRIGGER_OPTIONS;

	message: string;
	attachments: IUpload[];
	shared_contact_cards: string[];
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];

	active: boolean;
}
