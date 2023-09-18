import express from 'express';
import { GroupsController } from '../controller';
import { VerifyPayment } from '../../middleware';

const router = express.Router();

router.route('/:group_id').get(GroupsController.exportGroups);
router.route('/').all(VerifyPayment).get(GroupsController.groups);

export default router;
