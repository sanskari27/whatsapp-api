import { NextFunction, Request, Response } from 'express';
import { FileUtils, SingleFileUploadOptions } from '../../../utils/files';
import FileUpload, { ONLY_CSV_ALLOWED } from '../../../utils/files/FileUpload';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond, idValidator } from '../../../utils/ExpressUtils';
import { CSV_PATH } from '../../../config/const';
import CSVUploadService from '../../../database/services/csv_uploads';
import InternalError, { INTERNAL_ERRORS } from '../../../errors/internal-errors';

export async function csv(req: Request, res: Response, next: NextFunction) {
	const fileUploadOptions: SingleFileUploadOptions = {
		field_name: 'file',
		options: {
			fileFilter: ONLY_CSV_ALLOWED,
		},
	};

	const name = req.body.name;

	try {
		const uploadedFile = await FileUpload.SingleFileUpload(req, res, fileUploadOptions);
		const destination = __basedir + CSV_PATH + uploadedFile.filename;
		FileUtils.moveFile(uploadedFile.path, destination);
		new CSVUploadService(req.locals.user).addCSV(name, uploadedFile.filename);
		return Respond({
			res,
			status: 200,
			data: {
				name: name,
				fileName: uploadedFile.filename,
			},
		});
	} catch (err: unknown) {
		console.log(err);

		return next(new APIError(API_ERRORS.COMMON_ERRORS.FILE_UPLOAD_ERROR));
	}
}

export async function listCSV(req: Request, res: Response, next: NextFunction) {
	const csv_docs = await new CSVUploadService(req.locals.user).listCSVs();
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
		const csv_docs = await new CSVUploadService(req.locals.user).deleteCSV(id);
		return Respond({
			res,
			status: 200,
			data: {
				csv_list: csv_docs,
			},
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

const UploadsController = {
	csv,
	listCSV,
	deleteCSV,
};

export default UploadsController;
