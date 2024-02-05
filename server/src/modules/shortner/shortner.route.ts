import express from 'express';
import { IDValidator } from '../../middleware/idValidator';
import Shortner from './shortner.controller';
import { LinkValidator, UpdateLinkValidator, WhatsappLinkValidator } from './shortner.validator';

const router = express.Router();

router.route('/open/:id').get(Shortner.open);

router.route('/create-link').all(LinkValidator).post(Shortner.createLink);

router.route('/create-whatsapp-link').all(WhatsappLinkValidator).post(Shortner.createWhatsappLink);

router
	.route('/:id')
	.all(IDValidator, UpdateLinkValidator)
	.patch(Shortner.updateLink)
	.delete(Shortner.deleteLink);

router.route('/').get(Shortner.listAll);

export default router;
