import express from 'express';
import { IDValidator } from '../../middleware/idValidator';
import ReportsController from './report.controller';

const router = express.Router();

router.route('/campaign/:id/pause').all(IDValidator).post(ReportsController.pauseCampaign);
router.route('/campaign/:id/resume').all(IDValidator).post(ReportsController.resumeCampaign);
router.route('/campaign/:id/delete').all(IDValidator).delete(ReportsController.deleteCampaign);
router.route('/campaign/:id').all(IDValidator).get(ReportsController.generateReport);
router.route('/campaign').get(ReportsController.listCampaigns);

router.route('/polls').get(ReportsController.listPolls);

export default router;
