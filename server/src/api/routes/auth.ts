import express from 'express';
import { AuthController } from '../controller';

const router = express.Router();

router.route('/validate').get(AuthController.validateClientID);

export default router;
