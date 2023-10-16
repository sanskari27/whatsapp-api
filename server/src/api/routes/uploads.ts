import express from 'express';
import { UploadsController } from '../controller';

const router = express.Router();

router.route('/csv').post(UploadsController.csv);

export default router;
