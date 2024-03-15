import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { saveRefreshTokens } from '../config/cache';
import {
	AccessLevel,
	IS_PRODUCTION,
	JWT_COOKIE,
	JWT_REFRESH_COOKIE,
	JWT_SECRET,
} from '../config/const';
import { APIError, USER_ERRORS } from '../errors';
import { AccountService, AccountServiceFactory } from '../services/account';

const JWT_EXPIRE_TIME = 3 * 60 * 1000;
const REFRESH_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;

export default async function VerifyAccount(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies[JWT_COOKIE];

	let id = '';
	try {
		if (!token) {
			throw new Error('Token is required');
		}
		const decoded = verify(token, JWT_SECRET) as JwtPayload;
		id = decoded.id;
	} catch (e) {
		const refreshToken = req.cookies[JWT_REFRESH_COOKIE];
		if (!refreshToken) {
			return next(new APIError(USER_ERRORS.AUTHORIZATION_ERROR));
		}

		const service = await AccountService.isValidAuth(refreshToken);
		if (!service) {
			return next(new APIError(USER_ERRORS.AUTHORIZATION_ERROR));
		}
		req.locals.account = service;

		res.cookie(JWT_COOKIE, service.token, {
			sameSite: 'strict',
			expires: new Date(Date.now() + JWT_EXPIRE_TIME),
			httpOnly: IS_PRODUCTION,
			secure: IS_PRODUCTION,
		});
		const t = service.refreshToken;
		saveRefreshTokens(t, service.username);
		res.cookie(JWT_REFRESH_COOKIE, t, {
			sameSite: 'strict',
			expires: new Date(Date.now() + REFRESH_EXPIRE_TIME),
			httpOnly: IS_PRODUCTION,
			secure: IS_PRODUCTION,
		});

		next();
		return;
	}

	try {
		const service = await AccountServiceFactory.findByUsername(id);
		req.locals.account = service;

		res.cookie(JWT_COOKIE, service.token, {
			sameSite: 'strict',
			expires: new Date(Date.now() + JWT_EXPIRE_TIME),
			httpOnly: IS_PRODUCTION,
			secure: IS_PRODUCTION,
		});
		next();
	} catch (e) {
		return next(new APIError(USER_ERRORS.AUTHORIZATION_ERROR));
	}
}

export function verifyAccess(access_level: AccessLevel) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.locals.account.user_type === access_level) {
			next();
		} //TODO
		return next(new APIError(USER_ERRORS.ACCESS_LEVEL_LOW));
	};
}
