import express from 'express';
import Shortner from '../controller/shortner';

const router = express.Router();

router.route('/open/:id').get(Shortner.open);
router.route('/create-link').post(Shortner.createLink);
router.route('/create-whatsapp-link').post(Shortner.createWhatsappLink);

export default router;
