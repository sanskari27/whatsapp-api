import { NextFunction, Request, Response } from 'express';
import { APIError, COMMON_ERRORS } from '../../errors';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { CampaignService } from '../../services/messenger';
import VoteResponseService from '../../services/vote-response';
import CSVParser from '../../utils/CSVParser';
import { Respond, RespondCSV } from '../../utils/ExpressUtils';

async function listCampaigns(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;
	const messages = await new CampaignService(account).allCampaigns();
	return Respond({
		res,
		status: 200,
		data: {
			report: messages,
		},
	});
}
async function pauseCampaign(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	new CampaignService(account).pauseCampaign(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}
async function deleteCampaign(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	await new CampaignService(account).deleteCampaign(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}
async function resumeCampaign(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	new CampaignService(account).resumeCampaign(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function generateReport(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	try {
		const scheduler = new CampaignService(account);
		const reports = await scheduler.generateReport(req.locals.id);

		return RespondCSV({
			res,
			filename: 'Campaign Reports',
			data: CSVParser.exportCampaignReport(reports),
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
				return next(new APIError(COMMON_ERRORS.NOT_FOUND));
			}
		}
		return next(new APIError(COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

async function listPolls(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	const service = new VoteResponseService(account);
	const { title, options, isMultiSelect, export_csv } = req.query;

	if (!title || !options || !isMultiSelect) {
		if (export_csv === 'true') {
			const polls = await service.getPolls();
			return RespondCSV({
				res,
				filename: 'Poll Reports',
				data: CSVParser.exportPollReport(polls),
			});
		}

		const polls = await service.allPolls();

		return Respond({
			res,
			status: 200,
			data: { polls },
		});
	}

	const polls = await service.getPoll({
		title: String(title),
		options: (options as string).split('|$|'),
		isMultiSelect: String(isMultiSelect) === 'true',
	});

	if (export_csv === 'true') {
		return RespondCSV({
			res,
			filename: 'Poll Reports',
			data: CSVParser.exportPollReport(polls),
		});
	}
	return Respond({
		res,
		status: 200,
		data: {
			polls,
		},
	});
}

const ReportController = {
	listCampaigns,
	pauseCampaign,
	resumeCampaign,
	deleteCampaign,
	generateReport,
	listPolls,
};

export default ReportController;
