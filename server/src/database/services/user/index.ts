import { Types } from 'mongoose';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { IUser } from '../../../types/user';
import DateUtils from '../../../utils/DateUtils';
import { BotDB } from '../../repository/bot';
import ScheduledMessageDB from '../../repository/scheduled-message';
import { AuthDetailDB, UserDB } from '../../repository/user';
import { PaymentService } from '../payments';

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

	static async createUser(phone: string, isBusiness?: boolean) {
		const user = await UserDB.findOne({ phone });

		if (user) {
			if (isBusiness !== undefined && user.userType !== (isBusiness ? 'BUSINESS' : 'PERSONAL')) {
				user.userType = isBusiness ? 'BUSINESS' : 'PERSONAL';
				await user.save();
			}
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
		const isPaymentValid = this.user.subscription_expiry
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

	getExpiration() {
		return DateUtils.getMoment(this.user.subscription_expiry);
	}

	async addMonthToExpiry(months: number = 1) {
		if (this.user.subscription_expiry) {
			this.user.subscription_expiry = DateUtils.getMoment(this.user.subscription_expiry)
				.add(months, 'months')
				.toDate();
		} else {
			this.user.subscription_expiry = DateUtils.getMomentNow().add(months, 'months').toDate();
		}

		await this.user.save();
	}

	getPaymentRecords() {
		return PaymentService.getPaymentRecords(this.user.phone);
	}

	pauseSubscription(id: Types.ObjectId) {
		return PaymentService.pauseSubscription(id, this.user.phone);
	}

	resumeSubscription(id: Types.ObjectId) {
		return PaymentService.resumeSubscription(id, this.user.phone);
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
		}).populate('user');

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
			last_active: {
				$lt: DateUtils.getMomentNow().subtract(12, 'hours').toDate(),
			},
		});

		const scheduled = await ScheduledMessageDB.find({
			isSent: false,
			isFailed: false,
		}).distinct('client_id');
		const responseUsers = await BotDB.find().distinct('user');

		const scheduledSet = new Set(scheduled);
		const responseSet = new Set(responseUsers.map((user) => user.toString()));

		const sessions = revokable.filter(
			(auth) => !scheduledSet.has(auth.client_id) && !responseSet.has(auth.user.toString())
		);

		return sessions;
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
