import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import { IDValidator } from '../../utils/validators/idValidator';
import BotController from './bot.controller';
import { CreateBotValidator } from './bot.validator';

const router = express.Router();

router
	.route('/:id/responses')
	.all(PaymentValidator.isPseudoSubscribed, IDValidator)
	.get(BotController.downloadResponses);

router
	.route('/:id')
	.all(PaymentValidator.isPseudoSubscribed, IDValidator)
	.get(BotController.botById)
	.delete(BotController.deleteBot)
	.put(BotController.toggleActive)
	.all(CreateBotValidator)
	.patch(BotController.updateBot);

router
	.route('/')
	.all(PaymentValidator.isPseudoSubscribed)
	.get(BotController.allBots)
	.all(CreateBotValidator)
	.post(BotController.createBot);

export default router;
