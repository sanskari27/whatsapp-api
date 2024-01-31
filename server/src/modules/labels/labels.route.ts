import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import LabelsController from './labels.controller';
import { AssignLabelValidator } from './labels.validator';

const router = express.Router();

router.route('/export').all(PaymentValidator.isSubscribed).post(LabelsController.exportLabels);

router.route('/assign').all(AssignLabelValidator).post(LabelsController.addLabel);

router.route('/remove').all(AssignLabelValidator).post(LabelsController.removeLabel);

router.route('/').get(LabelsController.labels);

export default router;
