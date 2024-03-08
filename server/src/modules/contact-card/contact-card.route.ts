import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import VerifyDevice from '../../middleware/VerifyDevice';
import { IDValidator } from '../../middleware/idValidator';
import ContactCardController from './contact-card.controller';
import { CreateContactValidator } from './contact-card.validator';

const router = express.Router();

router
	.route('/:id')
	.all(VerifyAccount, VerifyDevice, IDValidator)
	.delete(ContactCardController.deleteContactCard)
	.all(CreateContactValidator)
	.put(ContactCardController.updateContactCard);

router
	.route('/')
	.all(VerifyAccount)
	.get(ContactCardController.listContactCards)
	.all(VerifyDevice, CreateContactValidator)
	.post(ContactCardController.createContactCard);

export default router;
