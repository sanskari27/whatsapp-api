import { $Enums } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { getRefreshTokens, removeRefreshTokens } from '../../config/cache';
import { JWT_EXPIRE, JWT_SECRET, REFRESH_EXPIRE, REFRESH_SECRET } from '../../config/const';
import { accountDB, userDevicesDB } from '../../config/postgres';
import { InternalError, USER_ERRORS } from '../../errors';
import DateUtils from '../../utils/DateUtils';
import AccountServiceFactory from './AccountServiceFactory';

export default class AccountService {
	private _username: string;
	private _phone: string | null;
	private _name: string | null;
	private _avatar: string | null;
	private _user_type: string;
	private _max_devices: number;
	private _subscription_expiry: Date;

	public constructor(
		username: string,
		details: {
			phone: string | null;
			name: string | null;
			avatar: string | null;
			user_type: $Enums.UserType;
			max_devices: number;
			subscription_expiry: Date;
		}
	) {
		this._username = username;
		this._phone = details.phone;
		this._name = details.name;
		this._avatar = details.avatar;
		this._user_type = details.user_type;
		this._max_devices = details.max_devices;
		this._subscription_expiry = details.subscription_expiry;
	}

	public get username() {
		return this._username;
	}

	public get user_type() {
		return this._user_type;
	}

	public get max_devices() {
		return this._max_devices;
	}

	public get details() {
		return {
			username: this._username,
			phone: this._phone,
			name: this._name,
			avatar: this._avatar,
			user_type: this._user_type,
			max_devices: this._max_devices,
			subscription_expiry: this._subscription_expiry,
		};
	}

	public get token() {
		return jwt.sign({ id: this._username }, JWT_SECRET, {
			expiresIn: JWT_EXPIRE,
		});
	}

	public get refreshToken() {
		return jwt.sign({ id: this._username }, REFRESH_SECRET, {
			expiresIn: REFRESH_EXPIRE,
		});
	}

	static async logout(refreshToken: string) {
		try {
			await removeRefreshTokens(refreshToken);
		} catch (e) {
			//ignored
		}
	}

	isSubscribed() {
		const isPaymentValid = DateUtils.getMoment(this._subscription_expiry).isAfter(
			DateUtils.getMomentNow()
		);

		return {
			isSubscribed: isPaymentValid,
		};
	}

	static async isValidAuth(refreshToken: string): Promise<AccountService | null> {
		const refreshTokens = await getRefreshTokens();

		try {
			const username = refreshTokens[refreshToken];
			return await AccountServiceFactory.findByUsername(username);
		} catch (e) {
			return null;
		}
	}

	async isValidDevice(client_id: string) {
		const link = await userDevicesDB.findUnique({
			where: {
				client_id: client_id,
			},
		});

		if (!link) {
			return null;
		}

		return {
			device: link.phone,
			client_id: link.client_id,
		};
	}

	async deviceLogout(client_id: string) {
		await userDevicesDB.delete({ where: { client_id } });
	}

	async listProfiles() {
		const account_links = await userDevicesDB.findMany({
			where: { username: this._username },
			include: { user: true, device: true },
		});

		return account_links.map((link) => {
			return {
				device_created_at: DateUtils.getMoment(link.device.first_login),
				client_id: link.client_id,
				phone: link.phone,
				name: link.user.name,
				userType: link.user.user_type,
				business_details: {
					description: link.device.description,
					email: link.device.email,
					websites: link.device.websites,
					latitude: link.device.latitude,
					longitude: link.device.longitude,
					address: link.device.address,
				},
			};
		});
	}

	async canAddProfile() {
		const listed_count = await userDevicesDB.count({ where: { username: this._username } });
		return listed_count < this._max_devices;
	}

	async addProfile(phone: string, client_id: string) {
		const linkExists = await userDevicesDB.findUnique({
			where: { client_id, phone },
		});

		if (linkExists) {
			return;
		}

		if (!this.canAddProfile()) {
			throw new InternalError(USER_ERRORS.MAX_DEVICE_LIMIT_REACHED);
		}

		await userDevicesDB.create({
			data: {
				client_id,
				username: this._username,
				phone,
			},
		});
	}

	async addMonthToExpiry(months: number = 1) {
		if (this._subscription_expiry) {
			if (DateUtils.getMoment(this._subscription_expiry).isAfter(DateUtils.getMomentNow())) {
				this._subscription_expiry = DateUtils.getMoment(this._subscription_expiry)
					.add(months, 'months')
					.toDate();
			} else {
				this._subscription_expiry = DateUtils.getMomentNow().add(months, 'months').toDate();
			}
		} else {
			this._subscription_expiry = DateUtils.getMomentNow().add(months, 'months').toDate();
		}

		await accountDB.update({
			where: { username: this.username },
			data: {
				subscription_expiry: this._subscription_expiry,
			},
		});
	}

	async setExpiry(date: moment.Moment) {
		this._subscription_expiry = date.toDate();
		await accountDB.update({
			where: { username: this.username },
			data: {
				subscription_expiry: this._subscription_expiry,
			},
		});
	}
}
