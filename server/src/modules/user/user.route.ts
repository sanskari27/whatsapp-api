import express from 'express';
import { VerifyAdmin } from '../../middleware';
import { IDValidator } from '../../middleware/idValidator';
import UserController from './user.controller';

const router = express.Router();

router
	.route('/:id/extend-expiry')
	.all(VerifyAdmin, IDValidator)
	.post(UserController.extendUserExpiry);

router.route('/').all(VerifyAdmin).get(UserController.listUsers);

export default router;
