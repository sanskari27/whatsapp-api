function formatMessageText(
	message: string,
	variables: string[],
	extract_from: {
		[key: string]: string;
	}
) {
	let _message = message;
	for (const variable of variables) {
		const _variable = variable.substring(2, variable.length - 2);
		_message = _message.replace(variable, extract_from[_variable] ?? '');
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
			const _variable = variable.substring(2, variable.length - 2);
			_caption = _caption.replace(variable, extract_from[_variable] ?? '');
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
