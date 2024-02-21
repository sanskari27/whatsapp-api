import mongoose from 'mongoose';
import IPendingRequest from '../../types/pending-request';

export enum PENDING_REQUEST {
	SAVED_CONTACTS = 'SAVED_CONTACTS',
	NON_SAVED_CONTACTS = 'NON_SAVED_CONTACTS',
}

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

const PendingRequestDB = mongoose.model<IPendingRequest>('WHATSAPP-PendingRequest', schema);

export default PendingRequestDB;
