import { NextFunction, Request, Response } from 'express';
import { APIError, COMMON_ERRORS } from '../../errors';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import BotService from '../../services/bot';
import CSVParser from '../../utils/CSVParser';
import { Respond, RespondCSV } from '../../utils/ExpressUtils';
import { CreateBotValidationResult } from './bot.validator';

async function allBots(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	const botService = new BotService(account);
	const bots = await botService.allBots();

	return Respond({
		res,
		status: 200,
		data: {
			bots: bots.map((bot) => ({
				...bot,
				devices: bot.devices.map((d) => d.client_id),
				attachments: bot.attachments.map(({ id }) => id),
				contacts: bot.contacts.map(({ id }) => id),
				nurturing: bot.nurturing.map((item) => ({
					...item,
					attachments: item.attachments.map(({ id }) => id),
					contacts: item.contacts.map(({ id }) => id),
				})),
			})),
		},
	});
}

async function botById(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	const botService = new BotService(account);
	try {
		const bot = await botService.boyByID(req.locals.id);

		return Respond({
			res,
			status: 200,
			data: {
				bot: {
					...bot,
					devices: bot.devices.map((d) => d.client_id),
					attachments: bot.attachments,
					contacts: bot.contacts,
					nurturing: bot.nurturing.map((item) => ({
						...item,
						attachments: item.attachments.map(({ id }) => id),
						contacts: item.contacts.map(({ id }) => id),
					})),
				},
			},
		});
	} catch (err) {
		return next(new APIError(COMMON_ERRORS.NOT_FOUND));
	}
}

async function createBot(req: Request, res: Response, next: NextFunction) {
	const data = req.locals.data as CreateBotValidationResult;

	const { account } = req.locals;

	const botService = new BotService(account);

	const bot = await botService.createBot(data);

	return Respond({
		res,
		status: 201,
		data: {
			bot: {
				...bot,
				devices: bot.devices.map((d) => d.client_id),
			},
		},
	});
}

async function updateBot(req: Request, res: Response, next: NextFunction) {
	const data = req.locals.data as CreateBotValidationResult;

	const { account } = req.locals;

	const botService = new BotService(account);

	try {
		const bot = await botService.modifyBot(req.locals.id, {
			...data,
		});

		return Respond({
			res,
			status: 200,
			data: {
				bot: {
					...bot,
					devices: bot.devices.map((d) => d.client_id),
					attachments: bot.attachments,
					contacts: bot.contacts,
				},
			},
		});
	} catch (err) {
		console.log(err);

		return next(new APIError(COMMON_ERRORS.NOT_FOUND));
	}
}

async function toggleActive(req: Request, res: Response, next: NextFunction) {
	try {
		const { account } = req.locals;

		const botService = new BotService(account);
		const bot = await botService.toggleActive(req.locals.id);

		return Respond({
			res,
			status: 200,
			data: {
				bot: {
					...bot,
					attachments: bot.attachments,
					contacts: bot.contacts,
				},
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
				return next(new APIError(COMMON_ERRORS.NOT_FOUND));
			}
		}
		return next(new APIError(COMMON_ERRORS.INTERNAL_SERVER_ERROR));
	}
}

async function deleteBot(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	const botService = new BotService(account);
	botService.deleteBot(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function downloadResponses(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	const botService = new BotService(account);
	const responses = await botService.botResponses(req.locals.id);

	return RespondCSV({
		res,
		filename: 'Exported Bot Responses',
		data: CSVParser.exportBotResponses(responses),
	});
}

const BotController = {
	allBots,
	botById,
	createBot,
	updateBot,
	toggleActive,
	deleteBot,
	downloadResponses,
};

export default BotController;
