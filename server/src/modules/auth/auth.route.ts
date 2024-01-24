import express from 'express';
import { VerifyClientID } from '../../middleware';
import AuthController from './auth.controller';

const router = express.Router();

router.route('/validate').get(AuthController.validateClientID);
router.route('/details').all(VerifyClientID).get(AuthController.details);
router.route('/logout').all(VerifyClientID).post(AuthController.logout);

export default router;
