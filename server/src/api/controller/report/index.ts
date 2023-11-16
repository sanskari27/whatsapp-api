import { NextFunction, Request, Response } from 'express';
import { MessageSchedulerService } from '../../../database/services';
import { Respond } from '../../../utils/ExpressUtils';

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

const ReportController = {
	listCampaigns,
	pauseCampaign,
	resumeCampaign,
	deleteCampaign,
};

export default ReportController;
