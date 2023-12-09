import express from 'express';
import { ContactCardController } from '../controller';

const router = express.Router();

router
	.route('/contact-card/:id')
	.put(ContactCardController.updateContactCard)
	.delete(ContactCardController.deleteContactCard);
router
	.route('/contact-card')
	.get(ContactCardController.listContactCards)
	.post(ContactCardController.createContactCard);

export default router;
