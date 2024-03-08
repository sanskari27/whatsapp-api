import { NextFunction, Request, Response } from 'express';
import { saveRefreshTokens } from '../../config/cache';
import { IS_PRODUCTION, JWT_COOKIE, JWT_REFRESH_COOKIE } from '../../config/const';
import { APIError, COMMON_ERRORS, ERRORS, InternalError, USER_ERRORS } from '../../errors';
import SocketServerProvider from '../../provider/socket';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { AccountService, AccountServiceFactory } from '../../services/account';
import { Respond, generateClientID } from '../../utils/ExpressUtils';
import {
	CreateAccountValidationResult,
	LoginValidationResult,
	UsernameValidationResult,
} from './auth.validator';

const JWT_EXPIRE_TIME = 3 * 60 * 1000;
const REFRESH_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;

async function addDevice(req: Request, res: Response, next: NextFunction) {
	const { account, accountService } = req.locals;

	if (!accountService.canAddProfile()) {
		return next(new APIError(ERRORS.USER_ERRORS.MAX_DEVICE_LIMIT_REACHED));
	}

	const client_id = generateClientID();

	const whatsappInstance = WhatsappProvider.getInstance(account, client_id);
	whatsappInstance.onDestroy(function (client_id) {
		SocketServerProvider.clientsMap.delete(client_id);
	});

	SocketServerProvider.clientsMap.set(client_id, whatsappInstance);
	return Respond({
		res,
		status: 200,
		data: {
			client_id: client_id,
		},
	});
}

async function isUsernameAvailable(req: Request, res: Response, next: NextFunction) {
	const { username } = req.locals.data as UsernameValidationResult;
	const taken = await AccountService.isUsernameTaken(username);

	if (taken) {
		return next(new APIError(ERRORS.USER_ERRORS.USERNAME_ALREADY_EXISTS));
	}

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function signup(req: Request, res: Response, next: NextFunction) {
	const { username, password, name, phone } = req.locals.data as CreateAccountValidationResult;
	try {
		const service = await AccountService.createAccount({ username, password, name, phone });

		res.cookie(JWT_COOKIE, service.token, {
			sameSite: 'strict',
			expires: new Date(Date.now() + JWT_EXPIRE_TIME),
			httpOnly: IS_PRODUCTION,
			secure: IS_PRODUCTION,
		});

		const t = service.refreshToken;
		saveRefreshTokens(t, service.id);

		res.cookie(JWT_REFRESH_COOKIE, t, {
			sameSite: 'strict',
			expires: new Date(Date.now() + REFRESH_EXPIRE_TIME),
			httpOnly: IS_PRODUCTION,
			secure: IS_PRODUCTION,
		});

		return Respond({
			res,
			status: 200,
			data: {},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(USER_ERRORS.USERNAME_ALREADY_EXISTS)) {
				return next(new APIError(USER_ERRORS.USERNAME_ALREADY_EXISTS));
			} else if (err.isSameInstanceof(USER_ERRORS.PHONE_ALREADY_EXISTS)) {
				return next(new APIError(USER_ERRORS.PHONE_ALREADY_EXISTS));
			}
		}
		return next(new APIError(COMMON_ERRORS.INTERNAL_SERVER_ERROR));
	}
}

async function login(req: Request, res: Response, next: NextFunction) {
	const { username, password, access_level } = req.locals.data as LoginValidationResult;
	try {
		const service = await AccountServiceFactory.createByUsernameAndPassword(
			username,
			password,
			access_level
		);

		res.cookie(JWT_COOKIE, service.token, {
			sameSite: 'strict',
			expires: new Date(Date.now() + JWT_EXPIRE_TIME),
			httpOnly: IS_PRODUCTION,
			secure: IS_PRODUCTION,
		});

		const t = service.refreshToken;
		saveRefreshTokens(t, service.id);

		res.cookie(JWT_REFRESH_COOKIE, t, {
			sameSite: 'strict',
			expires: new Date(Date.now() + REFRESH_EXPIRE_TIME),
			httpOnly: IS_PRODUCTION,
			secure: IS_PRODUCTION,
		});

		return Respond({
			res,
			status: 200,
			data: {},
		});
	} catch (err) {
		return next(new APIError(USER_ERRORS.USER_NOT_FOUND_ERROR));
	}
}

async function logout(req: Request, res: Response, next: NextFunction) {
	const refreshTokens = req.cookies[JWT_REFRESH_COOKIE] as string;
	res.clearCookie(JWT_COOKIE);
	res.clearCookie(JWT_REFRESH_COOKIE);
	await AccountService.logout(refreshTokens);
	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function validateAuth(req: Request, res: Response, next: NextFunction) {
	const refreshToken = req.cookies[JWT_REFRESH_COOKIE];
	if (!refreshToken) {
		return next(new APIError(USER_ERRORS.AUTHORIZATION_ERROR));
	}

	const authStatus = await AccountService.isValidAuth(refreshToken);
	if (!authStatus) {
		return next(new APIError(USER_ERRORS.AUTHORIZATION_ERROR));
	}

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function profiles(req: Request, res: Response, next: NextFunction) {
	const { accountService, account } = req.locals;

	return Respond({
		res,
		status: 200,
		data: {
			profiles: await accountService.listProfiles(),
			max_profiles: account.max_devices ?? 0,
		},
	});
}

async function removeDevice(req: Request, res: Response, next: NextFunction) {
	const { client_id } = req.body;

	if (!client_id) {
		return next(new APIError(COMMON_ERRORS.INVALID_FIELDS));
	}

	const { accountService, account } = req.locals;

	await accountService.removeDevice(client_id);
	const provider = WhatsappProvider.getInstance(account, client_id);
	provider.logoutClient();
	return Respond({
		res,
		status: 200,
		data: {},
	});
}

const AuthController = {
	addDevice,
	removeDevice,
	login,
	logout,
	validateAuth,
	isUsernameAvailable,
	signup,
	profiles,
};

export default AuthController;
