import express from 'express';
import { ContactCardController } from '../controller';

const router = express.Router();

router
	.route('/:id')
	.put(ContactCardController.updateContactCard)
	.delete(ContactCardController.deleteContactCard);
router
	.route('/')
	.get(ContactCardController.listContactCards)
	.post(ContactCardController.createContactCard);

export default router;
