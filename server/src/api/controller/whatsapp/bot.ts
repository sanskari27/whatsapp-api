import { Request, Response, NextFunction } from 'express';
import { Respond, idValidator } from '../../../utils/ExpressUtils';
import { z } from 'zod';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import BotService from '../../../database/services/bot';
import { BOT_TRIGGER_OPTIONS } from '../../../config/const';

async function allBots(req: Request, res: Response, next: NextFunction) {
	const botService = new BotService(req.locals.user);
	const bots = await botService.allBots();

	return Respond({
		res,
		status: 200,
		data: {
			bots: bots,
		},
	});
}

async function createBot(req: Request, res: Response, next: NextFunction) {
	const reqValidator = z.object({
		trigger: z.string().default(''),
		message: z.string().trim().default(''),
		respond_to_all: z.boolean().default(false),
		respond_to_recipients: z.string().trim().array().default([]),
		trigger_gap_seconds: z.number().positive().default(1),
		options: z.enum([
			BOT_TRIGGER_OPTIONS.EXACT_IGNORE_CASE,
			BOT_TRIGGER_OPTIONS.EXACT_MATCH_CASE,
			BOT_TRIGGER_OPTIONS.INCLUDES_IGNORE_CASE,
			BOT_TRIGGER_OPTIONS.INCLUDES_MATCH_CASE,
		]),
		shared_contact_cards: z.string().array().default([]),
		attachments: z
			.object({
				filename: z.string(),
				caption: z.string().optional(),
			})
			.array()
			.default([]),
	});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		console.log(reqValidatorResult.error);

		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const botService = new BotService(req.locals.user);
	const bot = botService.createBot(reqValidatorResult.data);

	return Respond({
		res,
		status: 201,
		data: {
			bot,
		},
	});
}
async function toggleActive(req: Request, res: Response, next: NextFunction) {
	const [isIDValid, id] = idValidator(req.params.id);

	if (!isIDValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	try {
		const botService = new BotService(req.locals.user);
		const bot = await botService.toggleActive(id);

		return Respond({
			res,
			status: 200,
			data: {
				bot: bot,
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
				return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR));
	}
}
async function deleteBot(req: Request, res: Response, next: NextFunction) {
	const [isIDValid, id] = idValidator(req.params.id);

	if (!isIDValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const botService = new BotService(req.locals.user);
	botService.deleteBot(id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

const BotController = {
	allBots,
	createBot,
	toggleActive,
	deleteBot,
};

export default BotController;
