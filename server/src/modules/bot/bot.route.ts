import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import PaymentValidator from '../../middleware/VerifyPayment';
import { IDValidator } from '../../middleware/idValidator';
import BotController from './bot.controller';
import { CreateBotValidator } from './bot.validator';

const router = express.Router();

router
	.route('/:id/responses')
	.all(VerifyAccount, PaymentValidator.isSubscribed, IDValidator)
	.get(BotController.downloadResponses);

router
	.route('/:id')
	.all(VerifyAccount, PaymentValidator.isSubscribed, IDValidator)
	.get(BotController.botById)
	.delete(BotController.deleteBot)
	.put(BotController.toggleActive)
	.all(CreateBotValidator)
	.patch(BotController.updateBot);

router
	.route('/')
	.all(VerifyAccount, PaymentValidator.isSubscribed)
	.get(BotController.allBots)
	.all(CreateBotValidator)
	.post(BotController.createBot);

export default router;
