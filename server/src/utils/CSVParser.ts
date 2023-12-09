import { json2csv } from 'json-2-csv';
import {
	TBusinessContact,
	TContact,
	TGroupBusinessContact,
	TGroupContact,
	TLabelBusinessContact,
	TLabelContact,
} from '../types/whatsapp/contact';

export default class CSVParser {
	static exportContacts(contacts: TContact[]) {
		const keys = [
			{
				field: 'public_name',
				title: 'Whatsapp Public Name',
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

		const csv = json2csv(contacts, {
			keys: keys,
			emptyFieldValue: '',
		});
		return csv;
	}
	static exportBusinessContacts(contacts: TBusinessContact[]) {
		const keys = [
			{
				field: 'public_name',
				title: 'Whatsapp Public Name',
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
				field: 'email',
				title: 'Email',
			},
			{
				field: 'description',
				title: 'Description',
			},
			{
				field: 'address',
				title: 'Address',
			},
			{
				field: 'country',
				title: 'Country',
			},
			{
				field: 'latitude',
				title: 'Latitude',
			},
			{
				field: 'longitude',
				title: 'Longitude',
			},
			{
				field: 'websites',
				title: 'Websites',
			},
		];

		const csv = json2csv(contacts, {
			keys: keys,
			emptyFieldValue: '',
		});
		return csv;
	}
	static exportGroupContacts(contacts: TGroupContact[]) {
		const keys = [
			{
				field: 'group_name',
				title: 'Group Name',
			},
			{
				field: 'user_type',
				title: 'User Type',
			},
			{
				field: 'public_name',
				title: 'Whatsapp Public Name',
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

		const csv = json2csv(contacts, {
			keys: keys,
			emptyFieldValue: '',
		});
		return csv;
	}
	static exportGroupBusinessContacts(contacts: TGroupBusinessContact[]) {
		const keys = [
			{
				field: 'group_name',
				title: 'Group Name',
			},
			{
				field: 'user_type',
				title: 'User Type',
			},
			{
				field: 'public_name',
				title: 'Whatsapp Public Name',
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
				field: 'email',
				title: 'Email',
			},
			{
				field: 'description',
				title: 'Description',
			},
			{
				field: 'address',
				title: 'Address',
			},
			{
				field: 'country',
				title: 'Country',
			},
			{
				field: 'latitude',
				title: 'Latitude',
			},
			{
				field: 'longitude',
				title: 'Longitude',
			},
			{
				field: 'websites',
				title: 'Websites',
			},
		];

		const csv = json2csv(contacts, {
			keys: keys,
			emptyFieldValue: '',
		});
		return csv;
	}
	static exportLabelContacts(contacts: TLabelContact[]) {
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
				title: 'Whatsapp Public Name',
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

		const csv = json2csv(contacts, {
			keys: keys,
			emptyFieldValue: '',
		});
		return csv;
	}
	static exportLabelBusinessContacts(contacts: TLabelBusinessContact[]) {
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
				title: 'Whatsapp Public Name',
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
				field: 'email',
				title: 'Email',
			},
			{
				field: 'description',
				title: 'Description',
			},
			{
				field: 'address',
				title: 'Address',
			},
			{
				field: 'country',
				title: 'Country',
			},
			{
				field: 'latitude',
				title: 'Latitude',
			},
			{
				field: 'longitude',
				title: 'Longitude',
			},
			{
				field: 'websites',
				title: 'Websites',
			},
		];

		const csv = json2csv(contacts, {
			keys: keys,
			emptyFieldValue: '',
		});
		return csv;
	}

	static exportCampaignReport(
		records: {
			campaign_name: string;
			receiver: string;
			message: string;
			attachments: number;
			contacts: number;
			status: string;
		}[]
	) {
		const keys = [
			{
				field: 'campaign_name',
				title: 'Campaign Name',
			},
			{
				field: 'receiver',
				title: 'Recipient',
			},
			{
				field: 'message',
				title: 'Message',
			},
			{
				field: 'attachments',
				title: 'Attachments',
			},
			{
				field: 'contacts',
				title: 'Contacts',
			},
			{
				field: 'status',
				title: 'Status',
			},
		];

		return json2csv(records, {
			keys: keys,
			emptyFieldValue: '',
		});
	}

	static exportPollReport(
		records: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
			voter_number: string;
			voter_name: string;
			group_name: string;
			selected_option: string[];
			voted_at: string;
		}[]
	): string {
		const keys = [
			{
				field: 'title',
				title: 'Title',
			},
			{
				field: 'options',
				title: 'Options',
			},
			{
				field: 'isMultiSelect',
				title: 'Multiple Select',
			},
			{
				field: 'voter_number',
				title: 'Voter Number',
			},
			{
				field: 'voter_name',
				title: 'Voter Name',
			},
			{
				field: 'group_name',
				title: 'Group name',
			},
			{
				field: 'selected_option',
				title: 'Selected Options',
			},
			{
				field: 'voted_at',
				title: 'Voted At',
			},
		];

		return json2csv(records, {
			keys: keys,
			emptyFieldValue: '',
		});
	}

	static async exportPayments(
		records: {
			date: string;
			amount: number;
		}[]
	) {
		const keys = [
			{
				field: 'date',
				title: 'Date',
			},
			{
				field: 'amount',
				title: 'Amount',
			},
		];

		const csv = await json2csv(records, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'payments.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async exportReport(
		reports: {
			message: string;
			receiver: string;
			attachments: number;
			contacts: number;
			campaign_name: string;
			status: string;
		}[]
	) {
		const keys = [
			{
				field: 'campaign_name',
				title: 'Campaign Name',
			},
			{
				field: 'receiver',
				title: 'Recipient',
			},
			{
				field: 'message',
				title: 'Message',
			},

			{
				field: 'attachments',
				title: 'Attachments',
			},
			{
				field: 'contacts',
				title: 'Contacts',
			},
			{
				field: 'status',
				title: 'Status',
			},
		];

		const csv = await json2csv(reports, {
			keys: keys,
			emptyFieldValue: '',
		});

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'campaign-report.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}

	static async downloadTemplate() {
		const keys = [
			{
				field: 'number',
				title: 'number',
			},
			{
				field: 'extra_variable',
				title: 'extra_variable',
			},
		];

		const csv = await json2csv(
			[{ number: '91790XXXX890', extra_variable: 'This can be used for message Customization' }],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('hidden', '');
		a.setAttribute('href', url);
		a.setAttribute('download', 'template.csv');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}
