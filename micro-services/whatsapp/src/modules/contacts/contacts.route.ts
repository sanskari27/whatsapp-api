import express from 'express';
import ContactsController from './contacts.controller';

const router = express.Router();

router.route('/saved').post(ContactsController.saved);
router.route('/non-saved').post(ContactsController.unsaved);

export default router;
