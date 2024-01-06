type Attachment = {
	caption: string;
	filename: string;
	custom_caption: boolean;
	id: string;
	name: string;
};

type AttachmentUiDetails = {
	isSaving: boolean;
	isDeleting: boolean;
	isUpdating: boolean;
	errorMessage: string;
};

export type AttachmentState = {
	attachments: Attachment[];
	selectedAttachment: Attachment;
	file: File | null;
	uiDetails: AttachmentUiDetails;
	selectedAttachments: string[];
};
