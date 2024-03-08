import { Document } from 'mongoose';
import { TASK_RESULT_TYPE, TASK_STATUS, TASK_TYPE } from '../../config/const';
import { IAccount } from '../account';

export default interface ITask extends Document {
	_id: Types.ObjectId;
	user: IAccount;
	type: TASK_TYPE;
	status: TASK_STATUS;
	data: string;
	data_result_type: TASK_RESULT_TYPE;
	description: string;
}
