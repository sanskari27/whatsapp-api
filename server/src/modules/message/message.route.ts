import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import VerifyDevice from '../../middleware/VerifyDevice';
import PaymentValidator from '../../middleware/VerifyPayment';
import MessageController from './message.controller';
import { ScheduleMessageValidator } from './message.validator';

const router = express.Router();

router
	.route('/')
	.all(VerifyAccount, VerifyDevice, PaymentValidator.isPseudoSubscribed, ScheduleMessageValidator)
	.post(MessageController.scheduleMessage);

export default router;
