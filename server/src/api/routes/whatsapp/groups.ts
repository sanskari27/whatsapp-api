import express from 'express';
import { GroupsController } from '../../controller';
import { VerifyPayment } from '../../../middleware';

const router = express.Router();

router.route('/export').all(VerifyPayment).get(GroupsController.exportGroups);
router.route('/').get(GroupsController.groups);

export default router;
