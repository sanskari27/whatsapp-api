import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { BOT_TRIGGER_OPTIONS, BOT_TRIGGER_TO } from '../../../config/const';
import BotService from '../../../database/services/bot';
import UploadService from '../../../database/services/uploads';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { Respond, idValidator } from '../../../utils/ExpressUtils';

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
		respond_to: z.enum([
			BOT_TRIGGER_TO.ALL,
			BOT_TRIGGER_TO.SAVED_CONTACTS,
			BOT_TRIGGER_TO.NON_SAVED_CONTACTS,
		]),
		trigger_gap_seconds: z.number().positive().default(1),
		options: z.enum([
			BOT_TRIGGER_OPTIONS.EXACT_IGNORE_CASE,
			BOT_TRIGGER_OPTIONS.EXACT_MATCH_CASE,
			BOT_TRIGGER_OPTIONS.INCLUDES_IGNORE_CASE,
			BOT_TRIGGER_OPTIONS.INCLUDES_MATCH_CASE,
		]),
		shared_contact_cards: z.string().array().default([]),
		attachments: z
			.string()
			.array()
			.default([])
			.refine((attachments) => !attachments.some((value) => !Types.ObjectId.isValid(value)))
			.transform((attachments) => attachments.map((value) => new Types.ObjectId(value))),
	});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		console.log(reqValidatorResult.error);

		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const botService = new BotService(req.locals.user);
	const [_, media_attachments] = await new UploadService(req.locals.user).listAttachments(
		reqValidatorResult.data.attachments
	);
	const bot = botService.createBot({ ...reqValidatorResult.data, attachments: media_attachments });

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
