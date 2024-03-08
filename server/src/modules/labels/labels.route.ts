import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import VerifyDevice from '../../middleware/VerifyDevice';
import PaymentValidator from '../../middleware/VerifyPayment';
import LabelsController from './labels.controller';
import { AssignLabelValidator } from './labels.validator';

const router = express.Router();

router
	.route('/export')
	.all(VerifyAccount, VerifyDevice, PaymentValidator.isSubscribed)
	.post(LabelsController.exportLabels);

router
	.route('/assign')
	.all(VerifyAccount, VerifyDevice, AssignLabelValidator)
	.post(LabelsController.addLabel);

router
	.route('/remove')
	.all(VerifyAccount, VerifyDevice, AssignLabelValidator)
	.post(LabelsController.removeLabel);

router.route('/').all(VerifyAccount, VerifyDevice).get(LabelsController.labels);

export default router;
