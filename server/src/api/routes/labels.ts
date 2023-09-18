import express from 'express';
import { LabelsController } from '../controller';

const router = express.Router();

router.get('/:label', LabelsController.exportLabels);
router.get('/', LabelsController.labels);

export default router;
