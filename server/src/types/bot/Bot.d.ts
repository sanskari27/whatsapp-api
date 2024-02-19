import { Document } from 'mongoose';
import { BOT_TRIGGER_OPTIONS, BOT_TRIGGER_TO } from '../../config/const';
import IContactCard from '../contact-cards';
import IUpload from '../uploads';
import { IUser } from '../users';

export default interface IBot extends Document {
	user: IUser;

	respond_to: BOT_TRIGGER_TO;

	trigger: string;
	trigger_gap_seconds: number;
	response_delay_seconds: number;

	options: BOT_TRIGGER_OPTIONS;

	startAt: string;
	endAt: string;

	message: string;
	attachments: IUpload[];
	shared_contact_cards: IContactCard[];
	polls: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}[];
	forward: {
		number: string;
		message: string;
	};
	group_respond: boolean;
	nurturing: {
		message: string;
		after: number;
		start_from: string;
		end_at: string;
		attachments?: IUpload[];
		shared_contact_cards?: IContactCard[];
		polls?: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[];
	}[];
	active: boolean;
}
