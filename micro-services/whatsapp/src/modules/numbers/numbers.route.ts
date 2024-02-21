import express from 'express';
import ContactsController from './numbers.controller';

const router = express.Router();

router.route('/validate').post(ContactsController.numbers);

export default router;
