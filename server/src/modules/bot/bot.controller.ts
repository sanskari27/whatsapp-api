import { NextFunction, Request, Response } from 'express';
import { APIError, COMMON_ERRORS } from '../../errors';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import BotService from '../../services/bot';
import UploadService from '../../services/uploads';
import CSVParser from '../../utils/CSVParser';
import { Respond, RespondCSV } from '../../utils/ExpressUtils';
import { CreateBotValidationResult } from './bot.validator';

async function allBots(req: Request, res: Response, next: NextFunction) {
	const { account, device } = req.locals;

	const botService = new BotService(account, device);
	const bots = await botService.allBots();

	return Respond({
		res,
		status: 200,
		data: {
			bots: bots.map((bot) => ({
				...bot,
				attachments: bot.attachments.map((attachments) => attachments.id),
				shared_contact_cards: bot.shared_contact_cards.map((cards) => cards._id),
			})),
		},
	});
}

async function botById(req: Request, res: Response, next: NextFunction) {
	const { account, device } = req.locals;

	const botService = new BotService(account, device);
	try {
		const bot = await botService.boyByID(req.locals.id);

		return Respond({
			res,
			status: 200,
			data: {
				bot: {
					...bot,
					attachments: bot.attachments.map((attachments) => attachments.id),
				},
			},
		});
	} catch (err) {
		return next(new APIError(COMMON_ERRORS.NOT_FOUND));
	}
}

async function createBot(req: Request, res: Response, next: NextFunction) {
	const data = req.locals.data as CreateBotValidationResult;

	const { account, device } = req.locals;

	const botService = new BotService(account, device);
	const [_, media_attachments] = await new UploadService(account).listAttachments(data.attachments);

	const bot = botService.createBot({
		...data,
		attachments: media_attachments,
	});

	return Respond({
		res,
		status: 201,
		data: {
			bot: {
				...bot,
				attachments: bot.attachments.map((attachments) => attachments.id),
			},
		},
	});
}

async function updateBot(req: Request, res: Response, next: NextFunction) {
	const data = req.locals.data as CreateBotValidationResult;

	const { account, device } = req.locals;

	const botService = new BotService(account, device);
	const [_, media_attachments] = await new UploadService(account).listAttachments(data.attachments);

	try {
		const bot = await botService.modifyBot(req.locals.id, {
			...data,
			attachments: media_attachments,
		});

		return Respond({
			res,
			status: 200,
			data: {
				bot: {
					...bot,
					attachments: bot.attachments.map((attachments) => attachments.id),
					shared_contact_cards: bot.shared_contact_cards.map((cards) => cards._id),
				},
			},
		});
	} catch (err) {
		return next(new APIError(COMMON_ERRORS.NOT_FOUND));
	}
}

async function toggleActive(req: Request, res: Response, next: NextFunction) {
	try {
		const {
			accountService: { account },
			device,
		} = req.locals;

		const botService = new BotService(account, device);
		const bot = await botService.toggleActive(req.locals.id);

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
				return next(new APIError(COMMON_ERRORS.NOT_FOUND));
			}
		}
		return next(new APIError(COMMON_ERRORS.INTERNAL_SERVER_ERROR));
	}
}

async function deleteBot(req: Request, res: Response, next: NextFunction) {
	const { account, device } = req.locals;

	const botService = new BotService(account, device);
	botService.deleteBot(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function downloadResponses(req: Request, res: Response, next: NextFunction) {
	const { account, device } = req.locals;

	const botService = new BotService(account, device);
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
