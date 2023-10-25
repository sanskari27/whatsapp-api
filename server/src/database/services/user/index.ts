import { Types } from 'mongoose';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { IAuthDetail, IUser } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';
import ScheduledMessageDB from '../../repository/scheduled-message';
import { AuthDetailDB, UserDB } from '../../repository/user';
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
			const auth = await AuthDetailDB.findOne({
				user: this.user._id,
				client_id,
			});
			if (auth && !auth.isRevoked) return;
			if (auth && auth.isRevoked) {
				await auth.remove();
			}
			await AuthDetailDB.create({
				user: this.user._id,
				client_id,
			});
		} catch (e) {
			//ignored
		}
	}
	async logout(client_id: string) {
		UserService.logout(client_id);
	}

	static async logout(client_id: string) {
		try {
			await AuthDetailDB.updateOne(
				{
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
		}).populate('user');

		if (!auth) return [false, null] as [boolean, null];

		const isPaymentValid = !auth.user.subscription_expiry
			? DateUtils.getMoment(auth.user.subscription_expiry).isAfter(DateUtils.getMomentNow())
			: false;

		if (isPaymentValid) {
			return [true, auth.user.subscription_expiry, auth.user] as [boolean, Date, IUser];
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

	getUser() {
		return this.user;
	}

	isSubscribed() {
		const isPaymentValid = !this.user.subscription_expiry
			? DateUtils.getMoment(this.user.subscription_expiry).isAfter(DateUtils.getMomentNow())
			: false;
		const isNew = DateUtils.getMoment(this.user.createdAt)
			.add(28, 'days')
			.isAfter(DateUtils.getMomentNow());
		return {
			isSubscribed: isPaymentValid,
			isNew: isNew,
		};
	}

	async getPaymentRecords() {
		return PaymentService.getPaymentRecords(this.user.phone);
	}

	async getRunningPayment() {
		return PaymentService.getRunningPayment(this.user.phone);
	}

	static async getUser(phone: string) {
		const service = await UserService.getService(phone);
		return service.getUser();
	}

	static async getRevokedSessions() {
		const revokable = await AuthDetailDB.find({
			isRevoked: false,
			revoke_at: {
				$lt: DateUtils.getMomentNow().toDate(),
			},
		});

		const sessions = revokable.filter((auth) => {
			const userService = new UserService(auth.user);
			const { isSubscribed } = userService.isSubscribed();
			return !isSubscribed;
		});

		return sessions;
	}

	static async getInactiveSessions() {
		const revokable = await AuthDetailDB.find({
			isRevoked: false,
			revoke_at: {
				$lt: DateUtils.getMomentNow().toDate(),
			},
		});

		const scheduled = await ScheduledMessageDB.find({
			isSent: false,
			isFailed: false,
		});

		const scheduleMap = scheduled.reduce(
			(acc, item) => {
				acc[item.sender_client_id] = true;
				return acc;
			},
			{} as {
				[key: string]: true;
			}
		);

		const sessionsPromise = revokable.map(async (auth) => {
			if (
				DateUtils.getMoment(auth.last_active).add(12, 'hours').isBefore(DateUtils.getMomentNow())
			) {
				if (!scheduleMap[auth.client_id]) {
					return auth;
				}
			}
			return null;
		});

		const sessions = (await Promise.all(sessionsPromise)).filter((auth) => auth !== null);

		return sessions as (IAuthDetail & {
			_id: Types.ObjectId;
		})[];
	}

	static async sessionDisconnected(client_id: string) {
		await AuthDetailDB.updateOne(
			{ client_id },
			{
				last_active: DateUtils.getMomentNow().toDate(),
			}
		);
	}
}
