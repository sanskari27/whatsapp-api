import { useState } from 'react';
import UploadsService from '../services/uploads.service';

export default function useAttachment() {
	const [addingAttachment, setAddingAttachment] = useState(false);
	const [attachments, setAttachments] = useState<
		{
			id: string;
			name: string;
			caption?: string;
			filename: string;
		}[]
	>([]);

	const add = (name: string, caption: string, file: File) => {
		setAddingAttachment(true);
		UploadsService.uploadAttachment({ name, caption, file })
			.then((res) => {
				if (!res) return;
				setAttachments((prev) => [...prev, res]);
			})
			.finally(() => {
				setAddingAttachment(false);
			});
	};

	return { addingAttachment, add, attachments };
}
