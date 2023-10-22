import { useEffect, useState } from 'react';
import UploadsService from '../services/uploads.service';

export default function useAttachment() {
	const [isLoading, setLoading] = useState(false);
	const [addingAttachment, setAddingAttachment] = useState(false);
	const [attachments, setAttachments] = useState<
		{
			id: string;
			name: string;
			caption?: string;
			filename: string;
		}[]
	>([]);

	useEffect(() => {
		setLoading(true);
		UploadsService.listAttachments()
			.then(setAttachments)
			.finally(() => setLoading(false));
	}, []);

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

	return { addingAttachment, isLoading, add, attachments };
}
