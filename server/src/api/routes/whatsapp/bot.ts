import express from 'express';
import { BotController } from '../../controller';

const router = express.Router();

router.route('/:id').put(BotController.toggleActive).delete(BotController.deleteBot);

router.route('/').post(BotController.createBot).get(BotController.allBots);

export default router;
