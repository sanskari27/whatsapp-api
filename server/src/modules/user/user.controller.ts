import { NextFunction, Request, Response } from 'express';
import AdminService from '../../services/user/admin-service';
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

const AuthController = {
	listUsers,
};

export default AuthController;
