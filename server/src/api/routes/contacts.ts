import express from 'express';
import { ContactsController } from '../controller';

const router = express.Router();

router.route('/').get(ContactsController.getContacts);

export default router;
