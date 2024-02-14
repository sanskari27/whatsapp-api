function formatMessageText(
	message: string,
	variables: string[],
	extract_from: {
		[key: string]: string;
	}
) {
	let _message = message;
	for (const variable of variables) {
		const _variable = `{{${variable}}}`;
		_message = _message.replace(_variable, extract_from[variable] ?? '');
	}
	return _message;
}

type Attachment = { id: string; caption: string; filename: string; name: string };

function formatAttachments(
	attachments: Attachment[],
	variables: string[],
	extract_from: {
		[key: string]: string;
	}
) {
	return attachments.map((attachment) => {
		let _caption = attachment.caption;
		for (const variable of variables) {
			const _variable = `{{${variable}}}`;
			_caption = _caption.replace(_variable, extract_from[variable] ?? '');
		}
		return {
			filename: attachment.filename,
			caption: _caption,
			name: attachment.name,
		};
	});
}

const MessagesUtils = {
	formatMessageText,
	formatAttachments,
};

export default MessagesUtils;
