import { Document } from 'mongoose';

export default interface IPendingRequest extends Document {
	client_id: string;
	key: string;
	type: PENDING_REQUEST;
	data: object;
	status: 'PENDING' | 'FAILED' | 'SUCCESS';
	error: string;
	reason: string;
}
