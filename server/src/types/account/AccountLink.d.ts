import { Document } from 'mongoose';
import IAccount from './Account';
import IWADevice from './WADevice';

export default interface IAccountLink extends Document {
	account: IAccount;
	device: IWADevice;
	client_id: string;
}
