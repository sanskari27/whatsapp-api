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
}
