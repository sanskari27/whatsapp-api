import { Document } from 'mongoose';
import { CAMPAIGN_STATUS } from '../../config/const';
import { IUser } from '../users';
import IMessage from './message';

export default interface ICampaign extends Document {
	name: string;
	description: string;
	user: IUser;
	status: CAMPAIGN_STATUS;
	messages: IMessage[];

	createdAt: Date;
	
	random_string: boolean;
	min_delay: number;
	max_delay: number;
	batch_size: number;
	batch_delay: number;
	startDate: string;
	startTime: string;
	endTime: string;
}
