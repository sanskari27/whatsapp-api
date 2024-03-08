import express from 'express';
import { AccessLevel } from '../../config/const';
import VerifyAccount, { verifyAccess } from '../../middleware/VerifyAccount';
import TokenController from './token.controller';

const router = express.Router();

router
	.route('/promotional')
	.all(VerifyAccount, verifyAccess(AccessLevel.Admin))
	.get(TokenController.getPromotionalMessage)
	.post(TokenController.setPromotionalMessage);

router
	.route('/')
	.all(VerifyAccount, verifyAccess(AccessLevel.Admin))
	.get(TokenController.getToken)
	.post(TokenController.generateToken);

router.route('/generate-new-coupon-code').get(TokenController.generateToken);
router.route('/validate/:token_code').get(TokenController.validateToken);

export default router;
