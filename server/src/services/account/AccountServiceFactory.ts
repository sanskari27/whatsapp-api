import { Types } from 'mongoose';
import { AccessLevel } from '../../config/const';
import { USER_ERRORS } from '../../errors';
import InternalError from '../../errors/internal-errors';
import { AccountDB } from '../../repository/account';
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
}
