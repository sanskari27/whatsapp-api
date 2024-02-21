import mongoose from 'mongoose';
import IPendingRequest from '../../types/pending-request';

export enum PENDING_REQUEST {
	SAVED_CONTACTS = 'SAVED_CONTACTS',
	NON_SAVED_CONTACTS = 'NON_SAVED_CONTACTS',
}

export const PendingRequestDB_NAME = 'whatsapp-PendingRequest';

const schema = new mongoose.Schema<IPendingRequest>({
	key: {
		type: String,
		required: true,
		unique: true,
	},
	client_id: {
		type: String,
		required: true,
	},
	type: {
		type: String,
		enum: Object.values(PENDING_REQUEST),
		required: true,
	},
	data: {
		type: Object,
	},
	status: {
		type: String,
		enum: ['PENDING', 'FAILED', 'SUCCESS'],
		default: 'PENDING',
	},
	error: String,
	reason: String,
});

const PendingRequestDB = mongoose.model<IPendingRequest>(PendingRequestDB_NAME, schema);

export default PendingRequestDB;
