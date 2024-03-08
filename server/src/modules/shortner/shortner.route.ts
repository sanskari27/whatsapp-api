import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import { IDValidator } from '../../middleware/idValidator';
import Shortner from './shortner.controller';
import { LinkValidator, UpdateLinkValidator, WhatsappLinkValidator } from './shortner.validator';

const router = express.Router();

router.route('/open/:id').get(Shortner.open);

router.route('/create-link').all(VerifyAccount, LinkValidator).post(Shortner.createLink);

router
	.route('/create-whatsapp-link')
	.all(VerifyAccount, WhatsappLinkValidator)
	.post(Shortner.createWhatsappLink);

router
	.route('/:id')
	.all(VerifyAccount, IDValidator, UpdateLinkValidator)
	.patch(Shortner.updateLink)
	.delete(Shortner.deleteLink);

router.route('/').all(VerifyAccount).get(Shortner.listAll);

export default router;
