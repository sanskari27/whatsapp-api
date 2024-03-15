import { NextFunction, Request, Response } from 'express';
import { APIError, COMMON_ERRORS } from '../../errors';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import SchedulerService from '../../services/messenger/Scheduler';
import CSVParser from '../../utils/CSVParser';
import { Respond, RespondCSV } from '../../utils/ExpressUtils';
import { CreateSchedulerValidationResult } from './scheduler.validator';

async function allSchedulers(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;
	const service = new SchedulerService(account);
	const schedulers = await service.allScheduler();

	return Respond({
		res,
		status: 200,
		data: {
			schedulers: schedulers,
		},
	});
}

async function schedulerById(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;
	const service = new SchedulerService(account);

	try {
		const scheduler = await service.schedulerByID(req.locals.id);

		return Respond({
			res,
			status: 200,
			data: {
				scheduler,
			},
		});
	} catch (err) {
		return next(new APIError(COMMON_ERRORS.NOT_FOUND));
	}
}

async function createScheduler(req: Request, res: Response, next: NextFunction) {
	const data = req.locals.data as CreateSchedulerValidationResult;

	const { account } = req.locals;
	const service = new SchedulerService(account);

	const scheduler = service.createScheduler(data);

	return Respond({
		res,
		status: 201,
		data: {
			scheduler,
		},
	});
}

async function updateScheduler(req: Request, res: Response, next: NextFunction) {
	const data = req.locals.data as CreateSchedulerValidationResult;
	const { account } = req.locals;
	const service = new SchedulerService(account);

	try {
		const bot = await service.modifyScheduler(req.locals.id, data);

		return Respond({
			res,
			status: 200,
			data: {
				bot: bot,
			},
		});
	} catch (err) {
		return next(new APIError(COMMON_ERRORS.NOT_FOUND));
	}
}

async function toggleActive(req: Request, res: Response, next: NextFunction) {
	try {
		const { account } = req.locals;
		const service = new SchedulerService(account);

		const scheduler = await service.toggleActive(req.locals.id);

		return Respond({
			res,
			status: 200,
			data: {
				scheduler: scheduler,
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

async function deleteScheduler(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;
	const service = new SchedulerService(account);
	service.deleteBot(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function downloadSchedulerReport(req: Request, res: Response, next: NextFunction) {
	try {
		const { account } = req.locals;
		const service = new SchedulerService(account);
		const reports = await service.generateReport(req.locals.id);

		return RespondCSV({
			res,
			filename: 'Scheduler Reports',
			data: CSVParser.exportSchedulerReport(reports),
		});
	} catch (err) {
		next(new APIError(COMMON_ERRORS.NOT_FOUND));
	}
}

const BotController = {
	allSchedulers,
	deleteScheduler,
	updateScheduler,
	createScheduler,
	toggleActive,
	schedulerById,
	downloadSchedulerReport,
};

export default BotController;
