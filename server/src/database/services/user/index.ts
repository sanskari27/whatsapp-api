import { AuthDetailDB, UserDB } from '../../repository/user';
import { IUser } from '../../../types/user';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import DateUtils from '../../../utils/DateUtils';
import PaymentService from '../payments';

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

	static async createUser(phone: string, { isBusiness = false }) {
		const user = await UserDB.findOne({ phone });

		if (user) {
			return new UserService(user);
		}

		const createdUser = await UserDB.create({
			phone,
			userType: isBusiness ? 'BUSINESS' : 'PERSONAL',
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

		const validPayment = await new PaymentService(auth.user).getRunningPayment();

		if (validPayment) {
			return [true, validPayment.expires_at, auth.user] as [boolean, Date, IUser];
		}

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

	static async getInactiveSessions() {
		const revokable = await AuthDetailDB.find({
			isRevoked: false,
			revoke_at: {
				$lt: DateUtils.getMomentNow().toDate(),
			},
		});

		const sessionsPromise = revokable.filter(async (auth) => {
			const validPayment = await PaymentService.isPaymentValid(auth.user);
			if (!validPayment) {
				return auth;
			} else {
				return null;
			}
		});

		const sessions = (await Promise.all(sessionsPromise)).filter((auth) => auth !== null);

		return sessions;
	}
}
