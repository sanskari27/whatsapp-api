import express from 'express';
import { IDValidator } from '../../middleware/idValidator';
import TemplateController from './template.controller';
import { TemplateValidator } from './template.validator';

const router = express.Router();

router
	.route('/:id')
	.all(IDValidator)
	.delete(TemplateController.deleteTemplate)
	.all(TemplateValidator)
	.put(TemplateController.updateTemplate);

router
	.route('/')
	.get(TemplateController.listTemplates)
	.all(TemplateValidator)
	.post(TemplateController.addTemplate);

export default router;
