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
		_message = _message.replace(new RegExp(_variable, 'g'), extract_from[variable] ?? '');
	}
	return _message;
}

type Attachment = { id: string; caption: string | null; filename: string; name: string };

function formatAttachments(
	attachments: Attachment[],
	variables: string[],
	extract_from: {
		[key: string]: string;
	}
) {
	return attachments.map((attachment) => {
		let _caption = attachment.caption ?? '';
		for (const variable of variables) {
			const _variable = `{{${variable}}}`;
			_caption = _caption.replace(new RegExp(_variable, 'g'), extract_from[variable] ?? '');
		}
		return {
			id: attachment.id,
			caption: _caption,
		};
	});
}

const MessagesUtils = {
	formatMessageText,
	formatAttachments,
};

export default MessagesUtils;
