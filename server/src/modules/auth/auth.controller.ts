import { NextFunction, Request, Response } from 'express';
import { saveRefreshTokens } from '../../config/cache';
import { IS_PRODUCTION, JWT_COOKIE, JWT_REFRESH_COOKIE } from '../../config/const';
import { APIError, USER_ERRORS } from '../../errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { UserService } from '../../services';
import { AccountService, AccountServiceFactory } from '../../services/account';
import { Respond } from '../../utils/ExpressUtils';
import { LoginValidationResult } from './auth.validator';

const JWT_EXPIRE_TIME = 3 * 60 * 1000;
const REFRESH_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;

async function validateClientID(req: Request, res: Response, next: NextFunction) {
	const client_id = req.headers['client-id'] as string;
	if (!client_id) {
		return next(new APIError(USER_ERRORS.SESSION_INVALIDATED));
	}

	const authStatus = await UserService.isValidAuth(client_id);
	const whatsapp = WhatsappProvider.getInstance(client_id);

	if (!authStatus.valid) {
		if (client_id) {
			whatsapp.logoutClient();
		}
		return next(new APIError(USER_ERRORS.SESSION_INVALIDATED));
	}

	return Respond({
		res,
		status: 200,
		data: {
			session_expires_at: authStatus.revoke_at,
			isWhatsappReady: whatsapp.isReady(),
			status: whatsapp.getStatus(),
		},
	});
}

async function details(req: Request, res: Response, next: NextFunction) {
	const userService = new UserService(req.locals.user);
	const paymentRecords = await userService.getPaymentRecords();
	const { isSubscribed, isNew } = userService.isSubscribed();

	return Respond({
		res,
		status: 200,
		data: {
			name: userService.getName(),
			phoneNumber: userService.getPhoneNumber(),
			isSubscribed: isSubscribed,
			canSendMessage: isSubscribed || isNew,
			subscriptionExpiration: isSubscribed ? userService.getExpiration('DD/MM/YYYY') : '',
			userType: userService.getUserType(),
			paymentRecords: paymentRecords,
		},
	});
}

async function user_logout(req: Request, res: Response, next: NextFunction) {
	WhatsappProvider.getInstance(req.locals.client_id).logoutClient();

	return Respond({
		res,
		status: 200,
		data: {},
	});
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
		data: {
			profiles: await authStatus.listProfiles(),
		},
	});

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

const AuthController = {
	validateClientID,
	details,
	user_logout,
	login,
	logout,
	validateAuth,
};

export default AuthController;
