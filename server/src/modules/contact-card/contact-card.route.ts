import express from 'express';
import { IDValidator } from '../../middleware/idValidator';
import ContactCardController from './contact-card.controller';
import { CreateContactValidator } from './contact-card.validator';

const router = express.Router();

router
	.route('/:id')
	.all(IDValidator)
	.delete(ContactCardController.deleteContactCard)
	.all(CreateContactValidator)
	.put(ContactCardController.updateContactCard);

router
	.route('/')
	.get(ContactCardController.listContactCards)
	.all(CreateContactValidator)
	.post(ContactCardController.createContactCard);

export default router;
