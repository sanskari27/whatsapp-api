import { AuthDetailDB, UserDB } from '../../repository/user';
import { IUser } from '../../../types/user';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import DateUtils from '../../../utils/DateUtils';

export default class UserService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	static async getService(phone: string) {
		const user = await UserDB.findOne({ phone });
		if (user === null) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.NOT_FOUND);
		}
		return new UserService(user);
	}

	static async createUser(phone: string) {
		const user = await UserDB.findOne({ phone });

		if (user) {
			return new UserService(user);
		}

		const createdUser = await UserDB.create({
			phone,
		});

		return new UserService(createdUser);
	}

	async login(client_id: string) {
		try {
			await AuthDetailDB.create({
				user: this.user._id,
				client_id,
			});
		} catch (e) {
			//ignored
		}
	}
	async logout(client_id: string) {
		try {
			await AuthDetailDB.updateOne(
				{
					user: this.user._id,
					client_id,
				},
				{
					$set: {
						isRevoked: true,
					},
				}
			);
		} catch (e) {
			//ignored
		}
	}

	static async isValidAuth(client_id: string) {
		const auth = await AuthDetailDB.findOne({
			client_id,
		});

		if (!auth) return [false, null] as [boolean, null];

		if (auth.isRevoked) return [false, null] as [boolean, null];

		if (DateUtils.getMoment(auth.revoke_at).isBefore(DateUtils.getMomentNow())) {
			if (!auth.isRevoked) {
				await auth.updateOne({
					isRevoked: true,
				});
			}
			return [false, null] as [boolean, null];
		}

		return [true, auth.revoke_at, auth.user] as [boolean, Date, IUser];
	}

	static async getUser(phone: string) {
		const user = await UserDB.findOne({ phone });
		if (user === null) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.NOT_FOUND);
		}
		return user;
	}
}
