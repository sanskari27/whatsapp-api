import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import AuthController from './auth.controller';
import { CreateAccountValidator, LoginValidator } from './auth.validator';

const router = express.Router();

router
	.route('/account/is-username-available')
	.all(VerifyAccount)
	.get(AuthController.isUsernameAvailable);

router.route('/account/add-device').all(VerifyAccount).post(AuthController.addDevice);
router.route('/account/remove-device').all(VerifyAccount).post(AuthController.removeDevice);
router.route('/account/profiles').all(VerifyAccount).get(AuthController.profiles);
router.route('/account/validate').all(VerifyAccount).get(AuthController.validateAuth);

router.route('/account/login').all(LoginValidator).post(AuthController.login);
router.route('/account/create-account').all(CreateAccountValidator).post(AuthController.signup);
router.route('/account/logout').all(VerifyAccount).post(AuthController.logout);

export default router;
