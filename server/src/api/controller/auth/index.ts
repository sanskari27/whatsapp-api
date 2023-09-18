import { NextFunction, Request, Response } from 'express';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { UserService } from '../../../database/services';

async function validateClientID(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const [isValidAuth, revoke_at] = await UserService.isValidAuth(client_id);

	if (!isValidAuth) {
		WhatsappProvider.removeClient(client_id);
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	return Respond({
		res,
		status: 200,
		data: {
			session_expires_at: revoke_at,
		},
	});
}

const AuthController = {
	validateClientID,
};

export default AuthController;
