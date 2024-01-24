import express from 'express';
import ReportsController from './report.controller';

const router = express.Router();

router.route('/campaign/:campaign_id/pause').post(ReportsController.pauseCampaign);
router.route('/campaign/:campaign_id/resume').post(ReportsController.resumeCampaign);
router.route('/campaign/:campaign_id/delete').delete(ReportsController.deleteCampaign);
router.route('/campaign/:campaign_id').get(ReportsController.generateReport);
router.route('/campaign').get(ReportsController.listCampaigns);

router.route('/polls').get(ReportsController.listPolls);

export default router;
