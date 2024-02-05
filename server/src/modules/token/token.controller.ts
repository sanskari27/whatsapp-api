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
};

export default TokenController;
