import { $Enums } from '@prisma/client';
import { AccessLevel } from '../../config/const';
import { accountDB, deviceDB } from '../../config/postgres';
import { InternalError, USER_ERRORS } from '../../errors';
import { comparePasswords, generateHashedPassword } from '../../utils/ExpressUtils';
import AccountService from './AccountService';

export default class AccountServiceFactory {
	static async createByUsernameAndPassword(
		username: string,
		password: string,
		access_level: AccessLevel
	): Promise<AccountService> {
		const account = await accountDB.findUnique({
			where: {
				username,
			},
		});

		if (account === null) {
			throw new InternalError(USER_ERRORS.USER_NOT_FOUND_ERROR);
		}

		const password_matched = await comparePasswords(password, account.password);
		if (!password_matched) {
			throw new InternalError(USER_ERRORS.USER_NOT_FOUND_ERROR);
		}

		return new AccountService(username, { ...account });
	}

	static async findByUsername(username: string): Promise<AccountService> {
		const account = await accountDB.findUnique({
			where: {
				username,
			},
		});

		if (account === null) {
			throw new InternalError(USER_ERRORS.USER_NOT_FOUND_ERROR);
		}
		return new AccountService(username, { ...account });
	}

	static async createAccount({
		name,
		phone,
		username,
		password,
	}: {
		name?: string;
		phone?: string;
		username: string;
		password: string;
	}) {
		try {
			const createdUser = await accountDB.create({
				data: {
					name,
					phone,
					username,
					password: await generateHashedPassword(password),
				},
			});

			return new AccountService(username, { ...createdUser });
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
		const device = await deviceDB.findUnique({ where: { phone } });

		if (device) {
			device.user_type = isBusiness ? $Enums.WA_UserType.BUSINESS : $Enums.WA_UserType.PERSONAL;
			device.name = name ?? '';
			device.description = business_details?.description ?? '';
			device.email = business_details?.email ?? '';
			device.websites = business_details?.websites ?? [];
			device.latitude = business_details?.latitude ?? 0;
			device.longitude = business_details?.longitude ?? 0;
			device.address = business_details?.address ?? '';
			await deviceDB.update({
				where: { phone },
				data: device,
			});

			return device;
		}

		const createdUser = await deviceDB.create({
			data: {
				phone,
				user_type: isBusiness ? $Enums.WA_UserType.BUSINESS : $Enums.WA_UserType.PERSONAL,
				name: name ?? '',
				description: business_details?.description ?? '',
				email: business_details?.email ?? '',
				websites: business_details?.websites ?? [],
				latitude: business_details?.latitude ?? 0,
				longitude: business_details?.longitude ?? 0,
				address: business_details?.address ?? '',
			},
		});

		return createdUser;
	}

	static async findDevice(phone: string) {
		return await deviceDB.findUnique({ where: { phone } });
	}
}
