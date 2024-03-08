import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import { IDValidator } from '../../middleware/idValidator';
import TasksController from './tasks.controller';

const router = express.Router();

router.route('/:id/download').all(VerifyAccount, IDValidator).get(TasksController.downloadTask);
router.route('/:id').all(VerifyAccount, IDValidator).delete(TasksController.deleteTask);
router.route('/').all(VerifyAccount).get(TasksController.listTasks);

export default router;
