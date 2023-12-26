import mongoose, { Types } from 'mongoose';
import { nanoid } from 'nanoid';
import IShortner from '../../../types/shortner';

const ShortnerSchema = new mongoose.Schema<IShortner>({
	user: {
		type: Types.ObjectId,
		ref: 'User',
	},
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

const ShortnerDB = mongoose.model<IShortner>('Shortner', ShortnerSchema);

export default ShortnerDB;
