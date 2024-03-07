type Attachment = {
	caption: string;
	filename: string;
	custom_caption: boolean;
	id: string;
	name: string;
};

type AttachmentUiDetails = {
	searchText: string;
	isSaving: boolean;
	isDeleting: boolean;
	isUpdating: boolean;
	errorMessage: string;
};

export type AttachmentState = {
	attachments: Attachment[];
	selectedAttachment: Attachment;
	file: File | null;
	size: string;
	url: string;
	type: string;
	uiDetails: AttachmentUiDetails;
	selectedAttachments: string[];
};
