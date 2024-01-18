import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { TemplateService } from '../../../database/services';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { Respond, idValidator } from '../../../utils/ExpressUtils';

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
	const reqValidator = z.object({
		name: z.string().trim(),
		message: z.string().trim(),
	});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const { name, message } = reqValidatorResult.data;

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
	const [isIDValid, id] = idValidator(req.params.id);
	const reqValidator = z.object({
		name: z.string().trim(),
		message: z.string().trim(),
	});

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success || !isIDValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const { name, message } = reqValidatorResult.data;

	const templateService = new TemplateService(req.locals.user);
	try {
		await templateService.updateTemplate(id, name, message);

		return Respond({
			res,
			status: 201,
			data: {
				template: {
					id: id,
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
	const [isIDValid, id] = idValidator(req.params.id);

	if (!isIDValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const templateService = new TemplateService(req.locals.user);
	try {
		await templateService.deleteTemplate(id);

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
