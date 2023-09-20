import express from 'express';
import { ContactsController } from '../controller';
import { VerifyPayment } from '../../middleware';

const router = express.Router();

router.route('/count').get(ContactsController.countContacts);
router.route('/').all(VerifyPayment).get(ContactsController.getContacts);

export default router;
