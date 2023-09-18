import express from 'express';
import { LabelsController } from '../controller';
import { VerifyPayment } from '../../middleware';

const router = express.Router();

router.route('/:label').all(VerifyPayment).get(LabelsController.exportLabels);
router.route('/').all(VerifyPayment).get(LabelsController.labels);

export default router;
