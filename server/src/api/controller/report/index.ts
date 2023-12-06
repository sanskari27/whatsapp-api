import { NextFunction, Request, Response } from 'express';
import { MessageSchedulerService } from '../../../database/services';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { Respond, idValidator } from '../../../utils/ExpressUtils';

async function listCampaigns(req: Request, res: Response, next: NextFunction) {
	const messages = await new MessageSchedulerService(req.locals.user).allCampaigns();

	return Respond({
		res,
		status: 200,
		data: {
			report: messages,
		},
	});
}
async function pauseCampaign(req: Request, res: Response, next: NextFunction) {
	new MessageSchedulerService(req.locals.user).pauseCampaign(req.params.campaign_id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}
async function deleteCampaign(req: Request, res: Response, next: NextFunction) {
	new MessageSchedulerService(req.locals.user).deleteCampaign(req.params.campaign_id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}
async function resumeCampaign(req: Request, res: Response, next: NextFunction) {
	new MessageSchedulerService(req.locals.user).resumeCampaign(req.params.campaign_id);

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function generateReport(req: Request, res: Response, next: NextFunction) {
	const [isCampaignValid, campaign_id] = idValidator(req.params.campaign_id);

	if (!isCampaignValid) {
		return next(new APIError(INTERNAL_ERRORS.COMMON_ERRORS.INVALID_FIELD));
	}
	try {
		const scheduler = new MessageSchedulerService(req.locals.user);
		const report = scheduler.generateReport(campaign_id);

		return Respond({
			res,
			status: 200,
			data: {
				report: report,
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
				return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR, err));
	}
}

const ReportController = {
	listCampaigns,
	pauseCampaign,
	resumeCampaign,
	deleteCampaign,
	generateReport,
};

export default ReportController;
