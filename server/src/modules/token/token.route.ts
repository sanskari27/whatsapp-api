import express from 'express';
import { VerifyAdmin } from '../../middleware';
import TokenController from './token.controller';

const router = express.Router();

router
	.route('/promotional')
	.all(VerifyAdmin)
	.get(TokenController.getPromotionalMessage)
	.post(TokenController.setPromotionalMessage);

router
	.route('/')
	.all(VerifyAdmin)
	.get(TokenController.getToken)
	.post(TokenController.generateToken);

router.route('/generate-new-coupon-code').get(TokenController.generateToken);
router.route('/validate/:token_code').get(TokenController.validateToken);

export default router;
