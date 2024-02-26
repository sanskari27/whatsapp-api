import { Types } from 'mongoose';
import { getRefreshTokens, removeRefreshTokens } from '../../config/cache';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { UserDB } from '../../repository/user';
import AdminDB from '../../repository/user/Admin';
import IAdmin from '../../types/user/Admin';
import DateUtils from '../../utils/DateUtils';
import { idValidator } from '../../utils/ExpressUtils';

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

	getClientID() {
		return this.admin.client_id ?? '';
	}
	async setClientID(client_id: string) {
		this.admin.client_id = client_id;
		this.admin.save();
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
			await removeRefreshTokens(refreshToken);
		} catch (e) {
			//ignored
		}
	}

	static async isValidAuth(
		refreshToken: string
	): Promise<{ valid: true; user: IAdmin } | { valid: false; user: null }> {
		const refreshTokens = await getRefreshTokens();

		const [isIDValid, id] = idValidator(refreshTokens[refreshToken] ?? '');

		if (!isIDValid) {
			return {
				valid: false,
				user: null,
			};
		}

		const user = await AdminDB.findById(id);
		if (user === null) {
			return {
				valid: false,
				user: null,
			};
		}
		return {
			valid: true,
			user: user,
		};
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
				description: user.business_details.description ?? '',
				email: user.business_details.email ?? '',
				websites: (user.business_details.websites ?? []).join(', '),
				latitude: user.business_details.latitude ?? '',
				longitude: user.business_details.longitude ?? '',
				address: user.business_details.address ?? '',
			};
		});
	}
}
