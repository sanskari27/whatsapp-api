import express from 'express';
import { AccessLevel } from '../../config/const';
import VerifyAccount, { verifyAccess } from '../../middleware/VerifyAccount';
import { IDValidator } from '../../middleware/idValidator';
import UserController from './user.controller';
import { PaymentRemainderValidator } from './user.validator';

const router = express.Router();

router
	.route('/:id/extend-expiry')
	.all(VerifyAccount, verifyAccess(AccessLevel.Admin), IDValidator)
	.post(UserController.extendUserExpiry);

router
	.route('/:id/payment-remainder')
	.all(VerifyAccount, verifyAccess(AccessLevel.Admin), IDValidator, PaymentRemainderValidator)
	.post(UserController.paymentRemainder);

router
	.route('/:id/logout')
	.all(VerifyAccount, verifyAccess(AccessLevel.Admin), IDValidator)
	.post(UserController.logoutUsers);

router.route('/').all(VerifyAccount, verifyAccess(AccessLevel.Admin)).get(UserController.listUsers);

export default router;
