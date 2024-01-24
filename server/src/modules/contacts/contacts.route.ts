import express from 'express';
import PaymentValidator from '../../middleware/VerifyPayment';
import ContactsController from './contacts.controller';
import { ValidateNumbersValidator } from './contacts.validator';

const router = express.Router();

router.route('/count').get(ContactsController.countContacts);
router.route('/validate').all(ValidateNumbersValidator).post(ContactsController.validate);
router.route('/').all(PaymentValidator.isSubscribed).get(ContactsController.getContacts);

export default router;
