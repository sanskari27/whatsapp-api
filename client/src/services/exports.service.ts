import ExcelUtils from '../utils/ExcelUtils';
import VCardUtils from '../utils/VCardUtils';
import ContactService from './contact.service';
import GroupService from './group.service';
import LabelService from './label.service';
import NumbersValidatorService from './numbers.service';
import ReportsService from './reports.service';

type ExportContactParams = {
    allContacts?: boolean;
    savedContacts?: boolean;
    unsavedContacts?: boolean;
    groupIDs?: string[];
    labelIDs?: string[];
};

export default class ExportsService {
    static async exportContactsExcel(options: ExportContactParams) {
        try {
            if (options.allContacts) {
                const allContacts = await ContactService.contacts({});
                ExcelUtils.exportContacts(allContacts, 'All Contacts');
            }

            if (options.savedContacts) {
                const savedContacts = await ContactService.contacts({
                    saved_contacts: true,
                });
                ExcelUtils.exportContacts(savedContacts, 'Saved Contacts');
            }

            if (options.unsavedContacts) {
                const unSavedContacts = await ContactService.contacts({
                    non_saved_contacts: true,
                });
                ExcelUtils.exportContacts(unSavedContacts, 'Unsaved Contacts');
            }

            if (options.groupIDs && options.groupIDs?.length > 0) {
                const participants = await GroupService.fetchGroup(
                    options.groupIDs
                );
                ExcelUtils.exportGroup(participants);
            }

            if (options.labelIDs && options.labelIDs?.length > 0) {
                const label_contacts = await LabelService.fetchLabel(
                    options.labelIDs
                );
                ExcelUtils.exportLabel(label_contacts);
            }
        } catch (err) {
            //ignore
        }
    }
    static async exportContactsVCF(options: ExportContactParams) {
        try {
            if (options.allContacts) {
                const allContacts = await ContactService.contacts({});
                VCardUtils.exportContacts(allContacts, 'All Contacts');
            }

            if (options.savedContacts) {
                const savedContacts = await ContactService.contacts({
                    saved_contacts: true,
                });
                VCardUtils.exportContacts(savedContacts, 'Saved Contacts');
            }

            if (options.unsavedContacts) {
                const unSavedContacts = await ContactService.contacts({
                    non_saved_contacts: true,
                });
                VCardUtils.exportContacts(unSavedContacts, 'Unsaved Contacts');
            }

            if (options.groupIDs && options.groupIDs?.length > 0) {
                const participants = await GroupService.fetchGroup(
                    options.groupIDs
                );
                VCardUtils.exportGroup(participants);
            }

            if (options.labelIDs && options.labelIDs?.length > 0) {
                const label_contacts = await LabelService.fetchLabel(
                    options.labelIDs
                );
                VCardUtils.exportLabel(label_contacts);
            }
        } catch (err) {
            //ignore
        }
    }

    static async exportValidNumbersExcel(data: {
        csv_file?: string;
        type: 'NUMBERS' | 'CSV';
        numbers?: string[];
    }) {
        try {
            const validContacts = await NumbersValidatorService.validateNumbers(
                data
            );
            ExcelUtils.exportContacts(validContacts, 'Valid Contacts');
        } catch (err) {
            //ignore
        }
    }

    static async exportPaymentsExcel(
        records: {
            date: string;
            amount: number;
        }[]
    ) {
        try {
            ExcelUtils.exportPayments(records);
        } catch (err) {
            //ignore
        }
    }

    static async exportCampaignReport(campaign_id: string) {
        await ReportsService.generateReport(campaign_id);
    }
}
