import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import VerifyDevice from '../../middleware/VerifyDevice';
import PaymentValidator from '../../middleware/VerifyPayment';
import { IDValidator } from '../../middleware/idValidator';
import SchedulerController from './scheduler.controller';
import { CreateSchedulerValidator } from './scheduler.validator';

const router = express.Router();

router
	.route('/:id/report')
	.all(VerifyAccount, VerifyDevice, IDValidator)
	.get(SchedulerController.downloadSchedulerReport);

router
	.route('/:id')
	.all(VerifyAccount, VerifyDevice, IDValidator)
	.get(SchedulerController.schedulerById)
	.delete(SchedulerController.deleteScheduler)
	.put(SchedulerController.toggleActive)
	.all(CreateSchedulerValidator, PaymentValidator.isPseudoSubscribed)
	.patch(SchedulerController.updateScheduler);

router
	.route('/')
	.all(VerifyAccount, VerifyDevice)
	.get(SchedulerController.allSchedulers)
	.all(PaymentValidator.isPseudoSubscribed)
	.all(CreateSchedulerValidator)
	.post(SchedulerController.createScheduler);

export default router;
