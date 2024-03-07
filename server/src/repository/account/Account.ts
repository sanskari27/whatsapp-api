import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';
import {
	AccessLevel,
	JWT_EXPIRE,
	JWT_SECRET,
	REFRESH_EXPIRE,
	REFRESH_SECRET,
} from '../../config/const';
import { IAccount } from '../../types/account';
import { generateHashedPassword } from '../../utils/ExpressUtils';

const accountSchema = new Schema<IAccount>({
	name: String,
	phone: String,
	avatar: String,
	username: {
		type: String,
		unique: true,
		index: true,
	},
	password: {
		type: String,
		select: false,
	},
	access_level: {
		type: String,
		enum: Object.keys(AccessLevel),
		required: true,
		default: AccessLevel.User,
	},
	subscription_expiry: Date,
});

accountSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		this.password = await generateHashedPassword(this.password);
		return next();
	} catch (err: any) {
		return next(err);
	}
});

accountSchema.methods.verifyPassword = async function (password: string) {
	return await bcrypt.compare(password, this.password);
};

accountSchema.methods.getSignedToken = function () {
	return jwt.sign({ id: this._id }, JWT_SECRET, {
		expiresIn: JWT_EXPIRE,
	});
};

accountSchema.methods.getRefreshToken = function () {
	const token = jwt.sign({ id: this._id }, REFRESH_SECRET, {
		expiresIn: REFRESH_EXPIRE,
	});
	return token;
};

const AccountDB = mongoose.model<IAccount>('Account', accountSchema);

export default AccountDB;
