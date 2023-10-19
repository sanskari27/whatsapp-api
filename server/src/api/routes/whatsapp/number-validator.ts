import express from 'express';
import { NumberValidatorController } from '../../controller';

const router = express.Router();

router.route('/validate').post(NumberValidatorController.validate);

export default router;
