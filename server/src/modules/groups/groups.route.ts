import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import { IDValidator } from '../../middleware/idValidator';
import GroupsController from './groups.controller';
import {
	CreateGroupValidator,
	GroupSettingValidator,
	MergeGroupValidator,
} from './groups.validator';

const router = express.Router();

router.route('/export').all(PaymentValidator.isSubscribed).post(GroupsController.exportGroups);

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

router.route('/refresh').post(GroupsController.refreshGroup);

router
	.route('/')
	.get(GroupsController.groups)
	.put(GroupsController.updateGroupsPicture)
	.all(CreateGroupValidator)
	.post(GroupsController.createGroup)
	.all(GroupSettingValidator)
	.patch(GroupsController.updateGroupsDetails);

export default router;
