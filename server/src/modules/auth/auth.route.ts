import express from 'express';
import { VerifyAdmin, VerifyClientID } from '../../middleware';
import AuthController from './auth.controller';
import { AdminLoginValidator } from './auth.validator';

const router = express.Router();

router.route('/validate').get(AuthController.validateClientID);
router.route('/details').all(VerifyClientID).get(AuthController.details);

router.route('/logout').all(VerifyClientID).post(AuthController.logout);

router
	.route('/admin/client-id')
	.all(VerifyAdmin)
	.get(AuthController.getAdminClientID)
	.post(AuthController.setAdminClientID);
    
router.route('/admin/validate').all(VerifyAdmin).get(AuthController.validateAdmin);
router.route('/admin/validate').all(VerifyAdmin).get(AuthController.validateAdmin);
router.route('/admin/login').all(AdminLoginValidator).post(AuthController.adminLogin);
router.route('/admin/logout').all(VerifyAdmin).post(AuthController.adminLogout);

export default router;
