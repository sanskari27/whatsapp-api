import APIInstance from '../config/APIInstance';

export default class MessageService {
    static async scheduleMessage(data: {
        type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
        numbers?: string[];
        csv_file?: string;
        group_ids?: string[];
        label_ids?: string[];
        message?: string;
        variables?: string[];
        shared_contact_cards?: string[];
        attachments?: string[];
        campaign_name: string;
        min_delay: number;
        max_delay: number;
        startTime?: string;
        endTime?: string;
        batch_delay?: number;
        batch_size?: number;
    }) {
        try {
            await APIInstance.post(`/whatsapp/schedule-message`, data);
            return null;
        } catch (err: any) {
            if (err.response.data.title === 'ALREADY_EXISTS')
                return 'Campaign name already exists';
            return 'Unable to schedule message';
        }
    }
}
