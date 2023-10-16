import { NextFunction, Request, Response } from 'express';
import { FileUtils, SingleFileUploadOptions } from '../../../utils/files';
import FileUpload, { ONLY_CSV_ALLOWED } from '../../../utils/files/FileUpload';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { Respond } from '../../../utils/ExpressUtils';
import { CSV_PATH } from '../../../config/const';

export async function csv(req: Request, res: Response, next: NextFunction) {
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
		return Respond({
			res,
			status: 200,
			data: {
				fileName: uploadedFile.filename,
			},
		});
	} catch (err: unknown) {
		console.log(err);

		return next(new APIError(API_ERRORS.COMMON_ERRORS.FILE_UPLOAD_ERROR));
	}
}

const UploadsController = {
	csv,
};

export default UploadsController;
