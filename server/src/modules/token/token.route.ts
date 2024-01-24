import express from 'express';
import  TokenController  from './token.controller';

const router = express.Router();

router.route('/generate-new-coupon-code').get(TokenController.generateToken);
router.route('/validate/:token_code').get(TokenController.validateToken);

export default router;
