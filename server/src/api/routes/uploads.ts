import express from 'express';
import { UploadsController } from '../controller';

const router = express.Router();

router.route('/csv/:id').delete(UploadsController.deleteCSV);
router.route('/csv').post(UploadsController.saveCSV).get(UploadsController.listCSV);

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
