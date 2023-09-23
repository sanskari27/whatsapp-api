import xlsx from 'json-as-xlsx';

type TContact = {
	name: string;
	number: string;
	isBusiness: string;
	country: string;
};

type TParticipant = TContact & {
	user_type: string;
	group_name: string;
};

type TLabelParticipant = TContact & {
	group_name: string;
	label: string;
};

type SaveContactParams = {
	allContacts?: TContact[];
	savedContacts?: TContact[];
	unsavedContacts?: TContact[];
	groupContacts?: {
		groupName: string;
		contacts: TParticipant[];
	};
	labelContacts?: {
		labelName: string;
		contacts: TLabelParticipant[];
	};
};

function saveContacts({
	allContacts,
	savedContacts,
	unsavedContacts,
	groupContacts,
	labelContacts,
}: SaveContactParams) {
	const data = [];

	if (allContacts) {
		data.push({
			sheet: 'All Contacts',
			columns: [
				{ label: 'Name', value: 'name' },
				{ label: 'Number', value: 'number' },
				{ label: 'Is Business', value: 'isBusiness' },
				{ label: 'Country', value: 'country' },
			],
			content: allContacts,
		});
	}

	if (savedContacts) {
		data.push({
			sheet: 'Saved Contacts',
			columns: [
				{ label: 'Name', value: 'name' },
				{ label: 'Number', value: 'number' },
				{ label: 'Is Business', value: 'isBusiness' },
				{ label: 'Country', value: 'country' },
			],
			content: savedContacts,
		});
	}

	if (unsavedContacts) {
		data.push({
			sheet: 'Unsaved Contacts',
			columns: [
				{ label: 'Name', value: 'name' },
				{ label: 'Number', value: 'number' },
				{ label: 'Is Business', value: 'isBusiness' },
				{ label: 'Country', value: 'country' },
			],
			content: unsavedContacts,
		});
	}

	if (groupContacts) {
		data.push({
			sheet: `Group: ${groupContacts.groupName}`,
			columns: [
				{ label: 'Name', value: 'name' },
				{ label: 'Number', value: 'number' },
				{ label: 'Is Business', value: 'isBusiness' },
				{ label: 'Country', value: 'country' },
				{ label: 'User Type', value: 'user_type' },
				{ label: 'Group Name', value: 'group_name' },
			],
			content: groupContacts.contacts,
		});
	}

	if (labelContacts) {
		data.push({
			sheet: `Label: ${labelContacts.labelName}`,
			columns: [
				{ label: 'Name', value: 'name' },
				{ label: 'Number', value: 'number' },
				{ label: 'Is Business', value: 'isBusiness' },
				{ label: 'Country', value: 'country' },
				{ label: 'Group Name', value: 'group_name' },
				{ label: 'Label Name', value: 'label_name' },
			],
			content: labelContacts.contacts,
		});
	}

	let settings = {
		fileName: 'Contacts',
		extraLength: 3,
		writeMode: 'writeFile',
		writeOptions: {},
	};

	xlsx(data, settings);
}

const ExcelUtils = {
	saveContacts,
};

export default ExcelUtils;
