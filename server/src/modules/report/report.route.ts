import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import { IDValidator } from '../../middleware/idValidator';
import ReportsController from './report.controller';

const router = express.Router();

router
	.route('/campaign/:id/pause')
	.all(VerifyAccount, IDValidator)
	.post(ReportsController.pauseCampaign);

router
	.route('/campaign/:id/resume')
	.all(VerifyAccount, IDValidator)
	.post(ReportsController.resumeCampaign);

router
	.route('/campaign/:id/delete')
	.all(VerifyAccount, IDValidator)
	.delete(ReportsController.deleteCampaign);

router.route('/campaign/:id').all(VerifyAccount, IDValidator).get(ReportsController.generateReport);

router.route('/campaign').all(VerifyAccount).get(ReportsController.listCampaigns);

router.route('/polls').all(VerifyAccount).get(ReportsController.listPolls);

export default router;
