import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import { IDValidator } from '../../middleware/idValidator';
import SchedulerController from './scheduler.controller';
import { CreateSchedulerValidator } from './scheduler.validator';

const router = express.Router();

router.route('/:id/report').all(IDValidator).get(SchedulerController.downloadSchedulerReport);
router.route('/:id/reschedule').all(IDValidator).get(SchedulerController.reschedule);

router
	.route('/:id')
	.all(IDValidator)
	.get(SchedulerController.schedulerById)
	.delete(SchedulerController.deleteScheduler)
	.put(SchedulerController.toggleActive)
	.all(CreateSchedulerValidator, PaymentValidator.isPseudoSubscribed)
	.patch(SchedulerController.updateScheduler);

router
	.route('/')
	.get(SchedulerController.allSchedulers)
	.all(PaymentValidator.isPseudoSubscribed)
	.all(CreateSchedulerValidator)
	.post(SchedulerController.createScheduler);

export default router;
