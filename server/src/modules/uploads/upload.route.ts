import express from 'express';
import VerifyAccount from '../../middleware/VerifyAccount';
import { IDValidator } from '../../middleware/idValidator';
import UploadsController from './upload.controllers';

const router = express.Router();

router
	.route('/csv/:id/download')
	.all(VerifyAccount, IDValidator)
	.get(UploadsController.downloadCSV);
router.route('/csv/:id').all(VerifyAccount, IDValidator).delete(UploadsController.deleteCSV);
router
	.route('/csv')
	.all(VerifyAccount)
	.post(UploadsController.saveCSV)
	.get(UploadsController.listCSV);

router
	.route('/attachment/:id/download')
	.all(VerifyAccount, IDValidator)
	.get(UploadsController.downloadAttachment);

router
	.route('/attachment/:id')
	.all(VerifyAccount, IDValidator)
	.get(UploadsController.attachmentById)
	.put(UploadsController.updateAttachmentFile)
	.patch(UploadsController.updateAttachment)
	.delete(UploadsController.deleteAttachment);

router
	.route('/attachment')
	.all(VerifyAccount)
	.post(UploadsController.addAttachment)
	.get(UploadsController.listAttachments);

export default router;
