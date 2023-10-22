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
router.route('/groups').get(GroupsController.groups);

router
	.route('/labels/export')
	.all(PaymentValidator.isSubscribed)
	.get(LabelsController.exportLabels);
router.route('/labels').get(LabelsController.labels);

router
	.route('/bot/:id')
	.all(PaymentValidator.isPseudoSubscribed)
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
