import express from 'express';
import UploadsController from './upload.controllers';

const router = express.Router();

router.route('/csv/:id/download').get(UploadsController.download);
router.route('/csv/:id').delete(UploadsController.deleteCSV);
router.route('/csv').post(UploadsController.saveCSV).get(UploadsController.listCSV);

router.route('/attachment/:id/download').get(UploadsController.download);

router
	.route('/attachment/:id')
	.get(UploadsController.attachmentById)
	.put(UploadsController.updateAttachmentFile)
	.patch(UploadsController.updateAttachment)
	.delete(UploadsController.deleteAttachment);

router
	.route('/attachment')
	.post(UploadsController.addAttachment)
	.get(UploadsController.listAttachments);

export default router;
