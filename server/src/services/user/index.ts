import { Types } from 'mongoose';
import { MESSAGE_STATUS } from '../../config/const';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { BotDB } from '../../repository/bot';
import { MessageDB } from '../../repository/messenger';
import { AuthDetailDB, UserDB } from '../../repository/user';
import { IUser } from '../../types/user';
import DateUtils from '../../utils/DateUtils';
import { PaymentService } from '../payments';

export default class UserService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	static async getService(phone: string | Types.ObjectId) {
		let user: IUser | null = null;
		if (typeof phone === 'string') {
			user = await UserDB.findOne({ phone });
		} else {
			user = await UserDB.findById(phone);
		}
		if (user === null) {
			throw new InternalError(INTERNAL_ERRORS.USER_ERRORS.NOT_FOUND);
		}
		return new UserService(user);
	}

	getID() {
		return new Types.ObjectId(this.user._id);
	}

	getName() {
		return this.user.name;
	}

	getPhoneNumber() {
		return this.user.phone;
	}

	getUserType() {
		return this.user.userType;
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

	getExpiration(format?: string) {
		if (format) {
			return DateUtils.getMoment(this.user.subscription_expiry).format(format);
		}
		return DateUtils.getMoment(this.user.subscription_expiry);
	}

	async save() {
		this.user.save();
	}

	async addMonthToExpiry(months: number = 1) {
		if (this.user.subscription_expiry) {
			if (DateUtils.getMoment(this.user.subscription_expiry).isAfter(DateUtils.getMomentNow())) {
				this.user.subscription_expiry = DateUtils.getMoment(this.user.subscription_expiry)
					.add(months, 'months')
					.toDate();
			} else {
				this.user.subscription_expiry = DateUtils.getMomentNow().add(months, 'months').toDate();
			}
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

	static async createUser({
		name,
		phone,
		isBusiness,
	}: {
		name?: string;
		phone: string;
		isBusiness?: boolean;
	}) {
		const user = await UserDB.findOne({ phone });

		if (user) {
			let isUpdated = false;
			if (isBusiness !== undefined && user.userType !== (isBusiness ? 'BUSINESS' : 'PERSONAL')) {
				user.userType = isBusiness ? 'BUSINESS' : 'PERSONAL';
				isUpdated = true;
			}
			if (name !== undefined && user.name !== name) {
				user.name = name;
				isUpdated = true;
			}
			if (isUpdated) {
				await user.save();
			}

			return new UserService(user);
		}

		const createdUser = await UserDB.create({
			name,
			phone,
			userType: isBusiness ? 'BUSINESS' : 'PERSONAL',
		});

		return new UserService(createdUser);
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

		if (!auth) {
			return {
				valid: false,
			};
		}

		const isPaymentValid = !auth.user.subscription_expiry
			? DateUtils.getMoment(auth.user.subscription_expiry).isAfter(DateUtils.getMomentNow())
			: false;

		if (isPaymentValid) {
			return {
				valid: true,
				revoke_at: auth.user.subscription_expiry,
				user: auth.user,
			};
		}

		if (auth.isRevoked) {
			return {
				valid: false,
			};
		}
		if (DateUtils.getMoment(auth.revoke_at).isBefore(DateUtils.getMomentNow())) {
			if (!auth.isRevoked) {
				await auth.updateOne({
					isRevoked: true,
				});
			}
			return {
				valid: false,
			};
		}

		return {
			valid: true,
			revoke_at: auth.revoke_at,
			user: auth.user,
		};
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

		const scheduled = await MessageDB.find({
			status: MESSAGE_STATUS.PENDING,
		}).distinct('user');
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
