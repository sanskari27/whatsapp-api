import { NextFunction, Request, Response } from 'express';
import { ATTACHMENTS_PATH, CSV_PATH } from '../../../config/const';
import UploadService from '../../../database/services/uploads';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';
import { Respond, idValidator } from '../../../utils/ExpressUtils';
import { FileUtils, SingleFileUploadOptions } from '../../../utils/files';
import FileUpload, { ONLY_CSV_ALLOWED } from '../../../utils/files/FileUpload';

export async function saveCSV(req: Request, res: Response, next: NextFunction) {
	const fileUploadOptions: SingleFileUploadOptions = {
		field_name: 'file',
		options: {
			fileFilter: ONLY_CSV_ALLOWED,
		},
	};

	try {
		const uploadedFile = await FileUpload.SingleFileUpload(req, res, fileUploadOptions);
		const destination = __basedir + CSV_PATH + uploadedFile.filename;
		FileUtils.moveFile(uploadedFile.path, destination);

		const name = req.body.name;

		new UploadService(req.locals.user).addCSV(name, uploadedFile.filename);
		return Respond({
			res,
			status: 200,
			data: {
				name: name,
				filename: uploadedFile.filename,
			},
		});
	} catch (err: unknown) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.FILE_UPLOAD_ERROR));
	}
}

export async function listCSV(req: Request, res: Response, next: NextFunction) {
	const csv_docs = await new UploadService(req.locals.user).listCSVs();
	return Respond({
		res,
		status: 200,
		data: {
			csv_list: csv_docs,
		},
	});
}
export async function deleteCSV(req: Request, res: Response, next: NextFunction) {
	const [isIDValid, id] = idValidator(req.params.id);

	if (!isIDValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	try {
		const filename = await new UploadService(req.locals.user).deleteCSV(id);
		const path = __basedir + CSV_PATH + filename;
		FileUtils.deleteFile(path);

		return Respond({
			res,
			status: 200,
			data: {},
		});
	} catch (err: unknown) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
				return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
			}
		}
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR));
	}
}

export async function addAttachment(req: Request, res: Response, next: NextFunction) {
	const fileUploadOptions: SingleFileUploadOptions = {
		field_name: 'file',
		options: {},
	};

	try {
		const uploadedFile = await FileUpload.SingleFileUpload(req, res, fileUploadOptions);
		const destination = __basedir + ATTACHMENTS_PATH + uploadedFile.filename;
		FileUtils.moveFile(uploadedFile.path, destination);

		const name = req.body.name;
		const caption = req.body.caption;

		const attachment = new UploadService(req.locals.user).addAttachment(
			name,
			caption,
			uploadedFile.filename
		);

		return Respond({
			res,
			status: 200,
			data: {
				attachment,
			},
		});
	} catch (err: unknown) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.FILE_UPLOAD_ERROR));
	}
}

export async function listAttachments(req: Request, res: Response, next: NextFunction) {
	const [attachments] = await new UploadService(req.locals.user).listAttachments();
	return Respond({
		res,
		status: 200,
		data: {
			attachments,
		},
	});
}

const UploadsController = {
	saveCSV,
	listCSV,
	deleteCSV,
	addAttachment,
	listAttachments,
};

export default UploadsController;
