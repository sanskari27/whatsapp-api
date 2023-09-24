import express from 'express';
import { LabelsController } from '../controller';
import { VerifyPayment } from '../../middleware';

const router = express.Router();

router.route('/export').all(VerifyPayment).get(LabelsController.exportLabels);
router.route('/').get(LabelsController.labels);

export default router;
