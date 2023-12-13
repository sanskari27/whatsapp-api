export type SchedulerState = {
    details: SchedulerDetails;
    all_campaigns: ScheduledCampaign[];

    recipients: {
        id: string;
        name: string;
        headers?: string[];
        _id?: string;
    }[];
    isRecipientsLoading: boolean;
    isBusinessAccount: boolean;
};

export type ScheduledCampaign = {
    campaign_id: string;
    campaignName: string;
    sent: number;
    failed: number;
    pending: number;
    isPaused: boolean;
};

export type SchedulerDetails = {
    type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
    numbers?: string[];
    csv_file: string;
    group_ids: string[];
    label_ids: string[];
    message: string;
    variables: string[];
    shared_contact_cards: {
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        links?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }[];
    attachments: string[];
    campaign_name: string;
    min_delay: number;
    max_delay: number;
    startTime: string;
    endTime: string;
    batch_delay: number;
    batch_size: number;
};

export default UserState;
