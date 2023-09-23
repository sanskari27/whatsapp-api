import ExcelUtils from '../utils/ExcelUtils';
import ContactService from './contact.service';
import GroupService from './group.service';
import LabelService from './label.service';

type ExportContactParams = {
	allContacts?: boolean;
	savedContacts?: boolean;
	unsavedContacts?: boolean;
	groupID?: string;
	labelID?: string;
};

type IContact = {
	name: string;
	number: string;
	isBusiness: string;
	country: string;
};

type IParticipant = IContact & {
	user_type: string;
	group_name: string;
};
type ILabelParticipant = IContact & {
	group_name: string;
	label: string;
};

export default class ExportsService {
	static async exportContacts(options: ExportContactParams) {
		try {
			const contacts = {
				allContacts: [] as IContact[],
				savedContacts: [] as IContact[],
				unsavedContacts: [] as IContact[],
				groupContacts: {
					groupName: '',
					contacts: [] as IParticipant[],
				},
				labelContacts: {
					labelName: '',
					contacts: [] as ILabelParticipant[],
				},
			};

			if (options.allContacts) {
				const allContacts = await ContactService.contacts({});
				contacts.allContacts = allContacts as IContact[];
			}

			if (options.savedContacts) {
				const savedContacts = await ContactService.contacts({
					saved_contacts: true,
				});
				contacts.savedContacts = savedContacts as IContact[];
			}

			if (options.unsavedContacts) {
				const unSavedContacts = await ContactService.contacts({
					non_saved_contacts: true,
				});
				contacts.unsavedContacts = unSavedContacts as IContact[];
			}

			if (options.groupID) {
				const group = await GroupService.fetchGroup(options.groupID);
				if (group) {
					contacts.groupContacts.groupName = group.name as string;
					contacts.groupContacts.contacts = group.participants as IParticipant[];
				}
			}

			if (options.labelID) {
				const label = await LabelService.fetchLabel(options.labelID);
				if (label) {
					contacts.labelContacts.labelName = label.name as string;
					contacts.labelContacts.contacts = label.entries as ILabelParticipant[];
				}
			}

			ExcelUtils.saveContacts({
				allContacts: options.allContacts ? contacts.allContacts : undefined,
				savedContacts: options.savedContacts ? contacts.savedContacts : undefined,
				unsavedContacts: options.unsavedContacts ? contacts.unsavedContacts : undefined,
				groupContacts: options.groupID ? contacts.groupContacts : undefined,
				labelContacts: options.labelID ? contacts.labelContacts : undefined,
			});

			return true;
		} catch (err) {
			return false;
		}
	}
}
