import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

type ResolvedFile = {
	filename: string;
	destination: string;
	path: string;
};
interface FileUploadOptions {
	field_name: string;
	options: multer.Options;
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const tempDir = path.join(global.__basedir, 'static', 'uploads');

		cb(null, tempDir); //you tell where to upload the files,
	},
	filename: (req, file, cb) => {
		cb(null, crypto.randomUUID() + path.extname(file.originalname));
	},
});

const SingleFileUpload = (
	req: Request,
	res: Response,
	{ field_name = 'file', options = {} }: FileUploadOptions
) => {
	const upload = multer({ storage, ...options }).single(field_name);

	return new Promise((resolve: (resolvedFile: ResolvedFile) => void, reject) => {
		upload(req, res, (err) => {
			if (err !== undefined && err !== null) {
				return reject(err);
			}

			if (req.file === undefined || req.file === null) {
				return reject(new Error('No files uploaded.'));
			}

			resolve({
				filename: req.file.filename,
				destination: req.file.destination,
				path: req.file.path,
			});
		});
	});
};

const MultiFileUpload = (
	req: Request,
	res: Response,
	{ field_name = 'files', options = {} }: FileUploadOptions
) => {
	const multi_upload = multer({ storage, ...options }).array(field_name, 1000);
	return new Promise((resolve: (resolvedFile: ResolvedFile[]) => void, reject) => {
		multi_upload(req, res, (err) => {
			if (err !== null) {
				return reject(err);
			}
			if (req.files === undefined || req.files === null) {
				return reject(new Error('No files uploaded.'));
			}
			const files = req.files as Express.Multer.File[];
			resolve(
				files.map((file) => ({
					filename: file.filename,
					destination: file.destination,
					path: file.path,
				}))
			);
		});
	});
};

export default { SingleFileUpload, MultiFileUpload };

export { FileUploadOptions, ResolvedFile };

const ONLY_IMAGES_ALLOWED = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	if (
		file.mimetype !== 'image/png' &&
		file.mimetype !== 'image/jpg' &&
		file.mimetype !== 'image/jpeg'
	) {
		return cb(new Error('Only JPG / PNG images are allowed'));
	}
	cb(null, true);
};

const ONLY_VIDEO_ALLOWED = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	if (file.mimetype !== 'video/mp4') {
		return cb(new Error('Only MP4 videos are allowed'));
	}
	cb(null, true);
};

const ONLY_PDF_ALLOWED = (
	req: Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	if (file.mimetype !== 'application/pdf') {
		return cb(new Error('Only PDF are allowed'));
	}
	cb(null, true);
};

export { ONLY_IMAGES_ALLOWED as ONLY_JPG_IMAGES_ALLOWED, ONLY_VIDEO_ALLOWED, ONLY_PDF_ALLOWED };
