import express from 'express';
import { MessageController } from '../controller';

const router = express.Router();

router.route('/send-message').post(MessageController.sendMessage);
router.route('/schedule-message').post(MessageController.scheduleMessage);

export default router;
