import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import VerifyDevice from '../../middleware/VerifyDevice';
import PaymentValidator from '../../middleware/VerifyPayment';
import ContactsController from './contacts.controller';
import { ValidateNumbersValidator } from './contacts.validator';

const router = express.Router();

router.route('/count').all(VerifyAccount, VerifyDevice).get(ContactsController.countContacts);
router
	.route('/validate')
	.all(VerifyAccount, VerifyDevice, ValidateNumbersValidator)
	.post(ContactsController.validate);
router
	.route('/')
	.all(VerifyAccount, VerifyDevice, PaymentValidator.isSubscribed)
	.post(ContactsController.getContacts);

export default router;
