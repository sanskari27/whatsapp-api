import { NextFunction, Request, Response } from 'express';
import { JwtPayload, verify } from 'jsonwebtoken';
import { JWT_COOKIE, JWT_REFRESH_COOKIE, JWT_SECRET } from '../config/const';
import APIError, { API_ERRORS } from '../errors/api-errors';
import AdminService from '../services/user/admin-service';
import { idValidator } from '../utils/ExpressUtils';

const JWT_EXPIRE_TIME = 3 * 60 * 1000;
const REFRESH_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;

export default async function VerifyAdmin(req: Request, res: Response, next: NextFunction) {
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
			return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
		}

		const [valid_auth, user] = await AdminService.isValidAuth(refreshToken);
		if (!valid_auth) {
			return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
		}
		req.locals.admin = user;

		res.cookie(JWT_COOKIE, user.getSignedToken(), {
			sameSite: 'strict',
			expires: new Date(Date.now() + JWT_EXPIRE_TIME),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		res.cookie(JWT_REFRESH_COOKIE, user.getRefreshToken(), {
			sameSite: 'strict',
			expires: new Date(Date.now() + REFRESH_EXPIRE_TIME),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});

		next();
		return;
	}
	const [isIDValid, valid_id] = idValidator(id);
	if (!id || !isIDValid) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}
	try {
		const user = await AdminService.getServiceByID(valid_id);
		req.locals.admin = user.getUser();

		res.cookie(JWT_COOKIE, user.getToken(), {
			sameSite: 'strict',
			expires: new Date(Date.now() + JWT_EXPIRE_TIME),
			httpOnly: true,
			secure: process.env.MODE !== 'development',
		});
		next();
	} catch (e) {
		return next(new APIError(API_ERRORS.USER_ERRORS.AUTHORIZATION_ERROR));
	}
}
