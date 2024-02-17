import { NextFunction, Request, Response } from 'express';
import Logger from 'n23-logger';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { UserService } from '../../services';
import AdminService from '../../services/user/admin-service';
import DateUtils from '../../utils/DateUtils';
import { Respond } from '../../utils/ExpressUtils';

async function listUsers(req: Request, res: Response, next: NextFunction) {
	const userService = new AdminService(req.locals.admin);

	return Respond({
		res,
		status: 200,
		data: {
			users: await userService.allUsers(),
		},
	});
}

async function extendUserExpiry(req: Request, res: Response, next: NextFunction) {
	try {
		if (!req.body.date) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
		}
		const userService = await UserService.getService(req.locals.id);
		userService.setExpiry(DateUtils.getMoment(req.body.date, 'YYYY-MM-DD'));

		return Respond({
			res,
			status: 200,
			data: {},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
	}
}

async function logoutUsers(req: Request, res: Response, next: NextFunction) {
	const userService = await UserService.getService(req.locals.id);
	const client_ids = await userService.logout();
	client_ids.forEach((id) => WhatsappProvider.getInstance(id).logoutClient());
	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function paymentRemainder(req: Request, res: Response, next: NextFunction) {
	const adminService = new AdminService(req.locals.admin);

	const whatsapp = WhatsappProvider.getInstance(adminService.getClientID());
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.WHATSAPP_NOT_READY));
	}
	const userService = await UserService.getService(req.locals.id);

	whatsapp
		.getClient()
		.sendMessage(userService.getPhoneNumber() + '@c.us', req.locals.data)
		.catch((err) => Logger.error('Error sending message:', err));

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

const AuthController = {
	listUsers,
	extendUserExpiry,
	logoutUsers,
	paymentRemainder,
};

export default AuthController;
