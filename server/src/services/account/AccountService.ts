import { Types } from 'mongoose';
import { getRefreshTokens, removeRefreshTokens } from '../../config/cache';
import { ERRORS, InternalError, USER_ERRORS } from '../../errors';
import { AccountDB, AccountLinkDB, WADeviceDB } from '../../repository/account';
import { IAccount, IWADevice } from '../../types/account';
import DateUtils from '../../utils/DateUtils';
import { idValidator } from '../../utils/ExpressUtils';
import AccountServiceFactory from './AccountServiceFactory';

export default class AccountService {
	private _account: IAccount;

	public constructor(account: IAccount) {
		this._account = account;
	}

	public get id() {
		return this._account._id;
	}

	public get name() {
		return this._account.name;
	}

	public get account() {
		return this._account;
	}

	public get access_level() {
		return this._account.access_level;
	}

	public get token() {
		return this._account.getSignedToken();
	}

	public get refreshToken() {
		return this._account.getRefreshToken();
	}

	static async logout(refreshToken: string) {
		try {
			await removeRefreshTokens(refreshToken);
		} catch (e) {
			//ignored
		}
	}

	async isSubscribed(deviceID: Types.ObjectId | null) {
		const isPaymentValid = this._account.subscription_expiry
			? DateUtils.getMoment(this._account.subscription_expiry).isAfter(DateUtils.getMomentNow())
			: false;

		let isNew = false;

		if (deviceID) {
			const device = await WADeviceDB.findById(deviceID);
			isNew = device
				? DateUtils.getMoment(device.createdAt).add(28, 'days').isAfter(DateUtils.getMomentNow())
				: false;
		}

		return {
			isSubscribed: isPaymentValid,
			isNew: isNew,
		};
	}

	static async isValidAuth(refreshToken: string): Promise<AccountService | null> {
		const refreshTokens = await getRefreshTokens();

		const [isIDValid, id] = idValidator(refreshTokens[refreshToken] ?? '');

		try {
			if (!isIDValid) {
				throw new Error('Invalid ID');
			}
			return await AccountServiceFactory.createByID(id);
		} catch (e) {
			return null;
		}
	}

	async isValidDevice(device_id: string) {
		const link = await AccountLinkDB.findOne({
			account: this._account._id,
			client_id: device_id,
		}).populate('device');

		if (!link) {
			return null;
		}

		return {
			device: link.device,
			client_id: link.client_id,
		};
	}

	async deviceLogout(client_id: string) {
		await AccountLinkDB.updateOne(
			{ client_id },
			{
				client_id: '',
			}
		);
	}

	async listProfiles() {
		const account_links = await AccountLinkDB.find({ account: this._account._id }).populate(
			'device'
		);
		return account_links.map((link) => {
			const { name, phone, userType, business_details: _d } = link.device;
			const business_details = _d ?? {};
			return {
				phone,
				name,
				userType,
				business_details: {
					description: business_details.description ?? '',
					email: business_details.email ?? '',
					websites: business_details.websites ?? [],
					latitude: business_details.latitude ?? 0,
					longitude: business_details.longitude ?? 0,
					address: business_details.address ?? '',
				},
				device_created_at: DateUtils.getMoment(link.device.createdAt),
				client_id: link.client_id,
			};
		});
	}

	async canAddProfile() {
		const listed_count = await AccountLinkDB.countDocuments({ account: this._account._id });

		if (listed_count >= this._account.max_devices) {
			return false;
		}
		return true;
	}

	async addProfile(device: IWADevice, c_id: string) {
		const listed_count = await AccountLinkDB.countDocuments({ account: this._account._id });
		console.log(listed_count);
		console.log(this._account.max_devices);

		if (listed_count >= this._account.max_devices) {
			throw new InternalError(USER_ERRORS.MAX_DEVICE_LIMIT_REACHED);
		}

		await AccountLinkDB.create({
			client_id: c_id,
			account: this._account,
			device: device,
		});
	}

	async removeDevice(client_id: string) {
		try {
			await AccountLinkDB.deleteOne({ account: this._account._id, client_id });
			return true;
		} catch (e) {
			return false;
		}
	}

	async addMonthToExpiry(months: number = 1) {
		if (this._account.subscription_expiry) {
			if (
				DateUtils.getMoment(this._account.subscription_expiry).isAfter(DateUtils.getMomentNow())
			) {
				this._account.subscription_expiry = DateUtils.getMoment(this._account.subscription_expiry)
					.add(months, 'months')
					.toDate();
			} else {
				this._account.subscription_expiry = DateUtils.getMomentNow().add(months, 'months').toDate();
			}
		} else {
			this._account.subscription_expiry = DateUtils.getMomentNow().add(months, 'months').toDate();
		}

		await this._account.save();
	}

	async setExpiry(date: moment.Moment) {
		if (this._account.subscription_expiry) {
			if (DateUtils.getMoment(this._account.subscription_expiry).isBefore(date)) {
				this._account.subscription_expiry = date.toDate();
				await this._account.save();
			}
		} else {
			this._account.subscription_expiry = date.toDate();
			await this._account.save();
		}
	}

	static async isUsernameTaken(username: string) {
		const exists = await AccountDB.findOne({ username });
		return exists !== null;
	}

	static async createAccount({
		name,
		phone,
		username,
		password,
	}: {
		name: string;
		phone: string;
		username: string;
		password: string;
	}) {
		const exists_username = await AccountDB.findOne({ username });
		const exists_phone = await AccountDB.findOne({ phone });
		if (exists_username) {
			throw new InternalError(ERRORS.USER_ERRORS.USERNAME_ALREADY_EXISTS);
		} else if (exists_phone) {
			throw new InternalError(ERRORS.USER_ERRORS.PHONE_ALREADY_EXISTS);
		}

		try {
			const account = await AccountDB.create({
				username,
				phone,
				name,
				password,
			});

			return new AccountService(account);
		} catch (err) {
			throw new InternalError(ERRORS.USER_ERRORS.USERNAME_ALREADY_EXISTS);
		}
	}
}
