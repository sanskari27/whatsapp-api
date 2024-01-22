import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import LabelsController from './labels.controller';
import { AssignLabelValidator } from './labels.validator';

const router = express.Router();

router
	.route('/labels/export')
	.all(PaymentValidator.isSubscribed)
	.get(LabelsController.exportLabels);

router.route('/labels/assign').all(AssignLabelValidator).post(LabelsController.addLabel);

router.route('/labels/remove').all(AssignLabelValidator).post(LabelsController.removeLabel);

router.route('/labels').get(LabelsController.labels);

export default router;
