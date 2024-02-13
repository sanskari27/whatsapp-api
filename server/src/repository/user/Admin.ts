import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose, { Schema } from 'mongoose';
import { JWT_EXPIRE, JWT_SECRET, REFRESH_EXPIRE, REFRESH_SECRET } from '../../config/const';
import IAdmin from '../../types/user/Admin';
import { generateHashedPassword } from '../../utils/ExpressUtils';

const adminSchema = new Schema<IAdmin>({
	name: String,
	username: {
		type: String,
		unique: true,
		index: true,
	},
	password: {
		type: String,
		select: false,
	},
	client_id: String,
});

adminSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		this.password = await generateHashedPassword(this.password);
		return next();
	} catch (err: any) {
		return next(err);
	}
});

adminSchema.methods.verifyPassword = async function (password: string) {
	return await bcrypt.compare(password, this.password);
};

adminSchema.methods.getSignedToken = function () {
	return jwt.sign({ id: this._id }, JWT_SECRET, {
		expiresIn: JWT_EXPIRE,
	});
};

adminSchema.methods.getRefreshToken = function () {
	const token = jwt.sign({ id: this._id }, REFRESH_SECRET, {
		expiresIn: REFRESH_EXPIRE,
	});
	return token;
};

const Admin = mongoose.model<IAdmin>('Admin', adminSchema);

export default Admin;
