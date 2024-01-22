import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import MessageController from './message.controller';

const router = express.Router();

router.route('/').all(PaymentValidator.isPseudoSubscribed).post(MessageController.scheduleMessage);

export default router;
