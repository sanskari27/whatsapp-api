import { NextFunction, Request, Response } from 'express';
import { APIError, COMMON_ERRORS } from '../../errors';
import { AccountServiceFactory } from '../../services/account';
import DateUtils from '../../utils/DateUtils';
import { Respond } from '../../utils/ExpressUtils';

async function listUsers(req: Request, res: Response, next: NextFunction) {
	// const userService = new AccountService(req.locals.account);
	// const options = {
	// 	csv: false,
	// };
	// if (req.query.csv === 'true') {
	// 	options.csv = true;
	// }
	// if (options.csv) {
	// 	return RespondCSV({
	// 		res,
	// 		filename: 'Exported Contacts',
	// 		data: CSVParser.exportUsersDetails(await userService.allUsers()),
	// 	});
	// } else {
	// 	return Respond({
	// 		res,
	// 		status: 200,
	// 		data: {
	// 			users: await userService.allUsers(),
	// 		},
	// 	});
	// }
}

async function extendUserExpiry(req: Request, res: Response, next: NextFunction) {
	try {
		if (!req.body.date) {
			return next(new APIError(COMMON_ERRORS.INVALID_FIELDS));
		}
		const accountService = await AccountServiceFactory.findByUsername(req.locals.id);
		accountService.setExpiry(DateUtils.getMoment(req.body.date, 'YYYY-MM-DD'));

		return Respond({
			res,
			status: 200,
			data: {},
		});
	} catch (err) {
		return next(new APIError(COMMON_ERRORS.NOT_FOUND));
	}
}

async function logoutUsers(req: Request, res: Response, next: NextFunction) {
	// const userService = await UserService.getService(req.locals.id);
	// const client_ids = await userService.logout();
	// client_ids.forEach((id) => WhatsappProvider.getInstance(id).logoutClient());
	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function paymentRemainder(req: Request, res: Response, next: NextFunction) {
	// const adminService = new AdminService(req.locals.admin);
	// const whatsapp = WhatsappProvider.getInstance(adminService.getClientID());
	// if (!whatsapp.isReady()) {
	// 	return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	// }
	// const userService = await UserService.getService(req.locals.id);
	// whatsapp
	// 	.getClient()
	// 	.sendMessage(userService.getPhoneNumber() + '@c.us', req.locals.data)
	// return Respond({
	// 	res,
	// 	status: 200,
	// 	data: {},
	// });
}

const AuthController = {
	listUsers,
	extendUserExpiry,
	logoutUsers,
	paymentRemainder,
};

export default AuthController;
