import { getRefreshTokens, removeRefreshTokens } from '../../config/cache';
import { InternalError, USER_ERRORS } from '../../errors';
import { AccountLinkDB } from '../../repository/account';
import { IAccount, IWADevice } from '../../types/account';
import DateUtils from '../../utils/DateUtils';
import { generateClientID, idValidator } from '../../utils/ExpressUtils';
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

	async addProfile(device: IWADevice) {
		const listed_count = await AccountLinkDB.countDocuments({ account: this._account._id });

		if (this._account.max_devices >= listed_count) {
			throw new InternalError(USER_ERRORS.MAX_DEVICE_LIMIT_REACHED);
		}
		const c_id = generateClientID();

		AccountLinkDB.create({
			client_id: c_id,
			account: this._account,
			device: device,
		});

		return c_id;
	}

	static async removeDevice(client_id: string) {
		try {
			await AccountLinkDB.deleteOne({ client_id });
		} catch (e) {
			//ignored
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
}
