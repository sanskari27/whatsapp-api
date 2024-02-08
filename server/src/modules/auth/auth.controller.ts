import { NextFunction, Request, Response } from 'express';
import { IS_PRODUCTION, JWT_COOKIE, JWT_REFRESH_COOKIE } from '../../config/const';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { UserService } from '../../services';
import AdminService from '../../services/user/admin-service';
import { Respond } from '../../utils/ExpressUtils';
import { AdminLoginValidationResult } from './auth.validator';

const JWT_EXPIRE_TIME = 3 * 60 * 1000;
const REFRESH_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000;

async function validateClientID(req: Request, res: Response, next: NextFunction) {
	const client_id = req.headers['client-id'] as string;
	if (!client_id) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const authStatus = await UserService.isValidAuth(client_id);
	const whatsapp = WhatsappProvider.getInstance(client_id);

	if (!authStatus.valid) {
		if (client_id) {
			whatsapp.logoutClient();
		}
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	return Respond({
		res,
		status: 200,
		data: {
			session_expires_at: authStatus.revoke_at,
			isWhatsappReady: whatsapp.isReady(),
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

async function updateDetails(req: Request, res: Response, next: NextFunction) {
	const userService = new UserService(req.locals.user);
	userService.updateGroupReplyMessage(req.body.group_reply_message);
	userService.save();

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function logout(req: Request, res: Response, next: NextFunction) {
	WhatsappProvider.getInstance(req.locals.client_id).logoutClient();

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function adminLogin(req: Request, res: Response, next: NextFunction) {
	const { username, password } = req.locals.data as AdminLoginValidationResult;
	try {
		const adminService = await AdminService.getService(username, password);

		res.cookie(JWT_COOKIE, adminService.getToken(), {
			sameSite: 'strict',
			expires: new Date(Date.now() + JWT_EXPIRE_TIME),
			httpOnly: IS_PRODUCTION,
			secure: IS_PRODUCTION,
		});
		res.cookie(JWT_REFRESH_COOKIE, adminService.getRefreshToken(), {
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
		return next(new APIError(API_ERRORS.USER_ERRORS.USER_NOT_FOUND_ERROR));
	}
}

async function adminLogout(req: Request, res: Response, next: NextFunction) {
	const refreshTokens = req.cookies[JWT_REFRESH_COOKIE] as string;
	res.clearCookie(JWT_COOKIE);
	res.clearCookie(JWT_REFRESH_COOKIE);
	await AdminService.logout(refreshTokens);
	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function validateAdmin(req: Request, res: Response, next: NextFunction) {
	return Respond({
		res,
		status: 200,
		data: {},
	});
}

const AuthController = {
	validateClientID,
	details,
	logout,
	updateDetails,
	adminLogin,
	adminLogout,
	validateAdmin,
};

export default AuthController;
