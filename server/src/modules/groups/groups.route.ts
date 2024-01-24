import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import { IDValidator } from '../../middleware/idValidator';
import GroupsController from './groups.controller';
import { CreateGroupValidator, MergeGroupValidator } from './groups.validator';

const router = express.Router();

router.route('/export').all(PaymentValidator.isSubscribed).get(GroupsController.exportGroups);

router
	.route('/merge/:id')
	.all(IDValidator)
	.delete(GroupsController.deleteMergedGroup)
	.all(MergeGroupValidator)
	.patch(GroupsController.updateMergedGroup);

router
	.route('/merge')
	.get(GroupsController.mergedGroups)
	.all(MergeGroupValidator)
	.post(GroupsController.mergeGroup);

router
	.route('/')
	.get(GroupsController.groups)
	.all(CreateGroupValidator)
	.post(GroupsController.createGroup);

export default router;
