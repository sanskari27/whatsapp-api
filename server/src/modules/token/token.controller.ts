import { NextFunction, Request, Response } from 'express';
import TokenService from '../../services/token';
import { Respond } from '../../utils/ExpressUtils';

async function generateToken(req: Request, res: Response, next: NextFunction) {
	const { token: code } = req.body;

	const token = await TokenService.createToken(code ?? undefined);

	return Respond({
		res,
		status: 200,
		data: { token },
	});
}

async function getToken(req: Request, res: Response, next: NextFunction) {
	const token = await TokenService.getToken();

	return Respond({
		res,
		status: 200,
		data: { token },
	});
}

async function getPromotionalMessage(req: Request, res: Response, next: NextFunction) {
	const { message_1, message_2 } = await TokenService.getPromotionalMessage();

	return Respond({
		res,
		status: 200,
		data: { message_1, message_2 },
	});
}

async function setPromotionalMessage(req: Request, res: Response, next: NextFunction) {
	const { message_1, message_2 } = req.body;
	await TokenService.setPromotionalMessage({ message_1, message_2 });

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function validateToken(req: Request, res: Response, next: NextFunction) {
	const token = req.params.token_code;

	const isValid = await TokenService.validateToken(token);

	return Respond({
		res,
		status: isValid ? 200 : 400,
	});
}

const TokenController = {
	generateToken,
	validateToken,
	getToken,
	getPromotionalMessage,
	setPromotionalMessage,
};

export default TokenController;
