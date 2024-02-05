import { Types } from 'mongoose';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { UserDB } from '../../repository/user';
import AdminDB from '../../repository/user/Admin';
import IAdmin from '../../types/user/Admin';
import DateUtils from '../../utils/DateUtils';

export default class AdminService {
	private admin: IAdmin;

	public constructor(user: IAdmin) {
		this.admin = user;
	}

	static async getService(username: string, password: string) {
		const user = await AdminDB.findOne({ username }).select('+password');
		if (user === null) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.NOT_FOUND);
		}
		const password_matched = await user.verifyPassword(password);
		if (!password_matched) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.INVALID_PASSWORD);
		}
		return new AdminService(user);
	}

	static async getServiceByID(id: Types.ObjectId) {
		const user = await AdminDB.findById(id);
		if (user === null) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.NOT_FOUND);
		}
		return new AdminService(user);
	}

	getName() {
		return this.admin.name;
	}

	getUser() {
		return this.admin;
	}

	getToken() {
		return this.admin.getSignedToken();
	}

	getRefreshToken() {
		return this.admin.getRefreshToken();
	}

	static async createUser({
		name,
		username,
		password,
	}: {
		name: string;
		username: string;
		password: string;
	}) {
		try {
			const createdUser = await AdminDB.create({
				name,
				username,
				password,
			});

			return new AdminService(createdUser);
		} catch (err) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.USERNAME_ALREADY_EXISTS);
		}
	}

	static async logout(refreshToken: string) {
		try {
			const user = await AdminDB.findOne({
				refreshTokens: refreshToken,
			}).select('refreshTokens');
			if (user) {
				user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
				await user.save();
			}
		} catch (e) {
			//ignored
		}
	}

	static async isValidAuth(refreshToken: string) {
		const user = await AdminDB.findOne({
			refreshTokens: refreshToken,
		});

		return [user !== null, user] as [boolean, IAdmin];
	}

	async allUsers() {
		const user = await UserDB.find();
		return user.map((user) => {
			return {
				id: user._id as string,
				name: user.name,
				phone: user.phone,
				type: user.userType,
				subscription_expiry: DateUtils.format(user.subscription_expiry, 'DD/MM/YYYY'),
			};
		});
	}
}
