import { Document, Types } from 'mongoose';

export interface IShortnerModel extends IShortner, Document {
	updateLink(id: Types.ObjectId, link: string): Promise<void>;
	saveLink(link: string): Promise<string>;
	getLink(key: string): Promise<string>;
}

export default interface IShortner extends Document {
	key: string;
	link: string;
}
