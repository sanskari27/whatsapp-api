import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import {
	BotController,
	ContactsController,
	GroupsController,
	LabelsController,
	MessageController,
	NumberValidatorController,
} from '../controller';

const router = express.Router();

router.route('/contacts/count').get(ContactsController.countContacts);
router.route('/contacts').all(PaymentValidator.isSubscribed).get(ContactsController.getContacts);

router
	.route('/groups/export')
	.all(PaymentValidator.isSubscribed)
	.get(GroupsController.exportGroups);

router
	.route('/groups/merge/:group_id')
	.patch(GroupsController.removeGroupFromMerge)
	.delete(GroupsController.deleteMergedGroup);
router.route('/groups/merge').post(GroupsController.mergeGroup).get(GroupsController.mergedGroups);

router.route('/groups').get(GroupsController.groups).post(GroupsController.createGroup);

router
	.route('/labels/export')
	.all(PaymentValidator.isSubscribed)
	.get(LabelsController.exportLabels);
router.route('/labels/assign').post(LabelsController.addLabel);
router.route('/labels/remove').post(LabelsController.removeLabel);
router.route('/labels').get(LabelsController.labels);

router
	.route('/bot/:id')
	.all(PaymentValidator.isPseudoSubscribed)
	.get(BotController.botById)
	.patch(BotController.updateBot)
	.put(BotController.toggleActive)
	.delete(BotController.deleteBot);

router
	.route('/bot')
	.all(PaymentValidator.isPseudoSubscribed)
	.post(BotController.createBot)
	.get(BotController.allBots);

router
	.route('/schedule-message')
	.all(PaymentValidator.isPseudoSubscribed)
	.post(MessageController.scheduleMessage);

router
	.route('/validate-numbers')
	.all(PaymentValidator.isPseudoSubscribed)
	.post(NumberValidatorController.validate);

export default router;
