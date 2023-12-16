import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import IShortner, { IShortnerModel } from '../../../types/shortner';

const ShortnerSchema = new mongoose.Schema<IShortner>({
	key: {
		type: String,
		unique: true,
	},
	link: {
		type: String,
	},
});

ShortnerSchema.pre('save', function (next) {
	if (!this.key) {
		this.key = nanoid();
	}
	next();
});

ShortnerSchema.statics.getLink = async function (key: string): Promise<string> {
	const Storage: IShortner = await this.findOne({ key });
	return Storage.link ?? '';
};

ShortnerSchema.statics.saveLink = async function (link: string): Promise<string> {
	const doc = await this.create({ link });
	return doc.key;
};

const ShortnerDB = mongoose.model<IShortner, IShortnerModel>('Shortner', ShortnerSchema);

export default ShortnerDB;
