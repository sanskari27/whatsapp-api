import express from 'express';
import { GroupsController } from '../controller';

const router = express.Router();

router.route('/:group_id').get(GroupsController.exportGroups);
router.route('/').get(GroupsController.groups);

export default router;
