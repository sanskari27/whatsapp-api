import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import PaymentValidator from '../../middleware/VerifyPayment';
import { IDValidator } from '../../middleware/idValidator';
import SchedulerController from './scheduler.controller';
import { CreateSchedulerValidator } from './scheduler.validator';

const router = express.Router();

router
	.route('/:id/report')
	.all(VerifyAccount, IDValidator)
	.get(SchedulerController.downloadSchedulerReport);

router
	.route('/:id')
	.all(VerifyAccount, IDValidator)
	.get(SchedulerController.schedulerById)
	.delete(SchedulerController.deleteScheduler)
	.put(SchedulerController.toggleActive)
	.all(CreateSchedulerValidator, PaymentValidator.isSubscribed)
	.patch(SchedulerController.updateScheduler);

router
	.route('/')
	.all(VerifyAccount)
	.get(SchedulerController.allSchedulers)
	.all(PaymentValidator.isSubscribed)
	.all(CreateSchedulerValidator)
	.post(SchedulerController.createScheduler);

export default router;
