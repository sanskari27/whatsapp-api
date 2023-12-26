import mongoose, { Types } from 'mongoose';
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
	let doc = await this.findOne({ link });
	if (doc) {
		return doc.key;
	}
	doc = await this.create({ link });
	return doc.key;
};

ShortnerSchema.statics.updateLink = async function (
	id: Types.ObjectId,
	link: string
): Promise<void> {
	let doc = await this.findById(id);
	if (!doc) {
		return;
	}
	doc.link = link;
	await doc.save();
	return doc.key;
};

const ShortnerDB = mongoose.model<IShortner, IShortnerModel>('Shortner', ShortnerSchema);

export default ShortnerDB;
