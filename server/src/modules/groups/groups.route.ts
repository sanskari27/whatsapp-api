import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import VerifyDevice from '../../middleware/VerifyDevice';
import PaymentValidator from '../../middleware/VerifyPayment';
import { IDValidator } from '../../middleware/idValidator';
import GroupsController from './groups.controller';
import {
	CreateGroupValidator,
	GroupSettingValidator,
	MergeGroupValidator,
} from './groups.validator';

const router = express.Router();

router
	.route('/export')
	.all(VerifyAccount, VerifyDevice, PaymentValidator.isSubscribed)
	.post(GroupsController.exportGroups);

router
	.route('/merge/:id')
	.all(VerifyAccount, VerifyDevice, IDValidator)
	.delete(GroupsController.deleteMergedGroup)
	.all(MergeGroupValidator)
	.patch(GroupsController.updateMergedGroup);

router
	.route('/merge')
	.all(VerifyAccount, VerifyDevice)
	.get(GroupsController.mergedGroups)
	.all(MergeGroupValidator)
	.post(GroupsController.mergeGroup);

router.route('/refresh').all(VerifyAccount, VerifyDevice).post(GroupsController.refreshGroup);

router
	.route('/')
	.all(VerifyAccount, VerifyDevice)
	.get(GroupsController.groups)
	.put(GroupsController.updateGroupsPicture)
	.all(CreateGroupValidator)
	.post(GroupsController.createGroup)
	.all(GroupSettingValidator)
	.patch(GroupsController.updateGroupsDetails);

export default router;
