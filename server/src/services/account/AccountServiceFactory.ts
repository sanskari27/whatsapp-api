import { Types } from 'mongoose';
import { AccessLevel } from '../../config/const';
import { InternalError, USER_ERRORS } from '../../errors';
import { AccountDB, WADeviceDB } from '../../repository/account';
import AccountService from './AccountService';

export default class AccountServiceFactory {
	static async createByUsernameAndPassword(
		username: string,
		password: string,
		access_level: AccessLevel
	): Promise<AccountService> {
		const user = await AccountDB.findOne({ username, access_level }).select('+password');
		if (user === null) {
			throw new InternalError(USER_ERRORS.USER_NOT_FOUND_ERROR);
		}

		const password_matched = await user.verifyPassword(password);
		if (!password_matched) {
			throw new InternalError(USER_ERRORS.USER_NOT_FOUND_ERROR);
		}
		return new AccountService(user);
	}

	static async createByID(id: Types.ObjectId): Promise<AccountService> {
		const user = await AccountDB.findById(id);
		if (user === null) {
			throw new InternalError(USER_ERRORS.USER_NOT_FOUND_ERROR);
		}
		return new AccountService(user);
	}

	static async createUser({
		name,
		number,
		username,
		password,
	}: {
		name?: string;
		number?: string;
		username: string;
		password: string;
	}) {
		try {
			const createdUser = await AccountDB.create({
				name,
				number,
				username,
				password,
			});

			return new AccountService(createdUser);
		} catch (err) {
			throw new InternalError(USER_ERRORS.USERNAME_ALREADY_EXISTS);
		}
	}

	static async createDevice({
		name,
		phone,
		isBusiness,
		business_details,
	}: {
		name?: string;
		phone: string;
		isBusiness?: boolean;
		business_details?: {
			description: string;
			email: string;
			websites: string[];
			latitude: number;
			longitude: number;
			address: string;
		};
	}) {
		const user = await WADeviceDB.findOne({ phone });

		if (user) {
			user.userType = isBusiness ? 'BUSINESS' : 'PERSONAL';
			user.name = name ?? '';
			user.business_details = business_details ?? {
				description: '',
				email: '',
				websites: [] as string[],
				latitude: 0,
				longitude: 0,
				address: '',
			};
			await user.save();

			return user;
		}

		const createdUser = await WADeviceDB.create({
			name,
			phone,
			userType: isBusiness ? 'BUSINESS' : 'PERSONAL',
			business_details: business_details ?? {
				description: '',
				email: '',
				websites: [] as string[],
				latitude: 0,
				longitude: 0,
				address: '',
			},
		});

		return createdUser;
	}
}
