import { Document } from 'mongoose';

export interface IShortnerModel extends IShortner, Document {
	saveLink(link: string): Promise<string>;
	getLink(key: string): Promise<string>;
}

export default interface IShortner extends Document {
	key: string;
	link: string;
}
