import express from 'express';
import ContactsRoute from './contacts/contacts.route';
import NumbersRoute from './numbers/numbers.route';

const router = express.Router();

// Next routes will be webhooks routes

// Next routes will be protected by VerifyClientID middleware

router.use('/contacts', ContactsRoute);
router.use('/numbers', NumbersRoute);

export default router;
