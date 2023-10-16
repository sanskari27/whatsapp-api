import express from 'express';
import { TemplateController } from '../controller';

const router = express.Router();

router
	.route('/:id')
	.put(TemplateController.updateTemplate)
	.delete(TemplateController.deleteTemplate);

router.route('/').post(TemplateController.addTemplate).get(TemplateController.listTemplates);

export default router;
