import express from 'express';
import { MessageController } from '../../controller';

const router = express.Router();

router.route('/schedule-message').post(MessageController.scheduleMessage);

export default router;
