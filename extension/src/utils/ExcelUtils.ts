import { json2csv } from 'json-2-csv';

type TContact = {
	name: string;
	number: string;
	isBusiness: string;
	country: string;
	public_name: string;
};

type TParticipant = TContact & {
	user_type: string;
	group_name: string;
};

type TLabelParticipant = TContact & {
	group_name: string;
	label: string;
};


export default class ExportsService {
	static async exportContacts(contacts: TContact[], sheetName: string) {
		const keys = [
			{
				field: 'public_name',
				title: 'Public Name',
			},
			{
				field: 'name',
				title: 'Name',
			},
			{
				field: 'number',
				title: 'Number',
			},
			{
				field: 'isBusiness',
				title: 'Is Business',
			},
			{
				field: 'country',
				title: 'Country',
			},
		];

		const csv = await json2csv(contacts, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', `${sheetName}.csv`);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportGroup(participants: TParticipant[]) {
		const keys = [
			{
				field: 'group_name',
				title: 'Group Name',
			},
			{
				field: 'public_name',
				title: 'Public Name',
			},
			{
				field: 'name',
				title: 'Name',
			},
			{
				field: 'number',
				title: 'Number',
			},
			{
				field: 'isBusiness',
				title: 'Is Business',
			},
			{
				field: 'country',
				title: 'Country',
			},
			{
				field: 'user_type',
				title: 'User Type',
			},
		];

		const csv = await json2csv(participants, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'group_contacts.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportLabel(participants: TLabelParticipant[]) {
		const keys = [
			{
				field: 'label',
				title: 'Label',
			},
			{
				field: 'group_name',
				title: 'Group Name',
			},
			{
				field: 'public_name',
				title: 'Public Name',
			},
			{
				field: 'name',
				title: 'Name',
			},
			{
				field: 'number',
				title: 'Number',
			},
			{
				field: 'isBusiness',
				title: 'Is Business',
			},
			{
				field: 'country',
				title: 'Country',
			},
		];

		const csv = await json2csv(participants, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'label_contacts.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}
