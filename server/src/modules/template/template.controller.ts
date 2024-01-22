import { NextFunction, Request, Response } from 'express';
import { TemplateService } from '../../database/services';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { Respond } from '../../utils/ExpressUtils';
import { TemplateValidationResult } from './template.validator';

async function listTemplates(req: Request, res: Response, next: NextFunction) {
	const templateService = new TemplateService(req.locals.user);

	return Respond({
		res,
		status: 200,
		data: {
			templates: await templateService.listTemplates(),
		},
	});
}
async function addTemplate(req: Request, res: Response, next: NextFunction) {
	const { name, message } = req.locals.data as TemplateValidationResult;

	const templateService = new TemplateService(req.locals.user);
	const template = templateService.addTemplate(name, message);

	return Respond({
		res,
		status: 201,
		data: {
			template,
		},
	});
}
async function updateTemplate(req: Request, res: Response, next: NextFunction) {
	const { name, message } = req.locals.data as TemplateValidationResult;

	const templateService = new TemplateService(req.locals.user);
	try {
		await templateService.updateTemplate(req.locals.id, name, message);

		return Respond({
			res,
			status: 201,
			data: {
				template: {
					id: req.locals.id,
					name,
					message,
				},
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
				return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR));
	}
}
async function deleteTemplate(req: Request, res: Response, next: NextFunction) {
	const templateService = new TemplateService(req.locals.user);
	try {
		await templateService.deleteTemplate(req.locals.id);

		return Respond({
			res,
			status: 200,
			data: {},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
				return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR));
	}
}

const TemplateController = {
	listTemplates,
	addTemplate,
	updateTemplate,
	deleteTemplate,
};

export default TemplateController;
