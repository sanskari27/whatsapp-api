import { json2csv } from 'json-2-csv';
import {
	TBusinessContact,
	TContact,
	TGroupBusinessContact,
	TGroupContact,
	TLabelBusinessContact,
	TLabelContact,
} from '../types/whatsapp';

type UserDetails = {
	name: string;
	phone: string;
	type: 'BUSINESS' | 'PERSONAL';
	subscription_expiry: string;
	description: string;
	email: string;
	websites: string;
	latitude: number;
	longitude: number;
	address: string;
};

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

		const csv = json2csv(
			contacts.length !== 0
				? contacts
				: [
						{
							public_name: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
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

		const csv = json2csv(
			contacts.length !== 0
				? contacts
				: [
						{
							public_name: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
		return csv;
	}
	static exportGroupContacts(contacts: TGroupContact[]) {
		const keys = [
			{
				field: 'group_id',
				title: 'Group ID',
			},
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

		const csv = json2csv(
			contacts.length !== 0
				? contacts
				: [
						{
							group_id: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
		return csv;
	}
	static exportGroupBusinessContacts(contacts: TGroupBusinessContact[]) {
		const keys = [
			{
				field: 'group_id',
				title: 'Recipient ID',
			},
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

		const csv = json2csv(
			contacts.length !== 0
				? contacts
				: [
						{
							group_id: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
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

		const csv = json2csv(
			contacts.length !== 0
				? contacts
				: [
						{
							label: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
		return csv;
	}
	static exportLabelBusinessContacts(records: TLabelBusinessContact[]) {
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

		const csv = json2csv(
			records.length !== 0
				? records
				: [
						{
							label: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
		return csv;
	}

	static exportCampaignReport(
		records: {
			campaign_name: string;
			description: string;
			sender: string | null;
			receiver: string;
			message: string;
			attachments: number;
			contacts: number;
			polls: number;
			status: string;
		}[]
	) {
		const keys = [
			{
				field: 'campaign_name',
				title: 'Campaign Name',
			},
			{
				field: 'description',
				title: 'Description',
			},
			{
				field: 'receiver',
				title: 'Recipient',
			},
			{
				field: 'sender',
				title: 'Sender',
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
				field: 'polls',
				title: 'Polls',
			},
			{
				field: 'status',
				title: 'Status',
			},
			{
				field: 'scheduled_at',
				title: 'Scheduled At',
			},
		];

		return json2csv(
			records.length !== 0
				? records
				: [
						{
							campaign_name: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
	}

	static exportSchedulerReport(
		records: {
			name: string;
			receiver: string;
			message: string;
			attachments: number;
			contacts: number;
			polls: number;
			status: string;
		}[]
	) {
		const keys = [
			{
				field: 'name',
				title: 'Scheduler Name',
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
				field: 'polls',
				title: 'Polls',
			},
			{
				field: 'status',
				title: 'Status',
			},
			{
				field: 'scheduled_at',
				title: 'Scheduled At',
			},
		];

		return json2csv(
			records.length !== 0
				? records
				: [
						{
							name: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
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
				title: 'Number',
			},
			{
				field: 'voter_name',
				title: 'Name',
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
				title: 'Responded At',
			},
		];

		return json2csv(
			records.length !== 0
				? records
				: [
						{
							title: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
	}

	static exportUsersDetails(records: UserDetails[]) {
		const keys = [
			{
				field: 'name',
				title: 'Name',
			},
			{
				field: 'phone',
				title: 'Phone Number',
			},
			{
				field: 'type',
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
			{
				field: 'subscription_expiry',
				title: 'Subscription Expires',
			},
		];

		return json2csv(
			records.length !== 0
				? records
				: [
						{
							name: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
	}

	static exportBotResponses(
		records: {
			trigger: string;
			sender: string;
			triggered_at: string;
			triggered_by: string;
		}[]
	) {
		const keys = [
			{
				field: 'trigger',
				title: 'Trigger',
			},
			{
				field: 'sender',
				title: 'Sender',
			},
			{
				field: 'recipient',
				title: 'Recipient',
			},
			{
				field: 'triggered_at',
				title: 'Triggered At',
			},
			{
				field: 'triggered_by',
				title: 'Triggered By',
			},
		];

		return json2csv(
			records.length !== 0
				? records
				: [
						{
							trigger: 'No records found.',
						},
				  ],
			{
				keys: keys,
				emptyFieldValue: '',
			}
		);
	}
}
