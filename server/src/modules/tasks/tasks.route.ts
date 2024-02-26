import express from 'express';
import { IDValidator } from '../../middleware/idValidator';
import TasksController from './tasks.controller';

const router = express.Router();

router.route('/:id/download').all(IDValidator).get(TasksController.downloadTask);
router.route('/:id').all(IDValidator).delete(TasksController.deleteTask);
router.route('/').get(TasksController.listTasks);

export default router;
