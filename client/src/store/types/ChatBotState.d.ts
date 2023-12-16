import { ContactCard } from './ContactCardState';

export type ChatBotState = {
    all_chatbos: ChatBot[];
    trigger: string;
    message: string;
    respond_to: 'ALL' | 'SAVED_CONTACTS' | 'NON_SAVED_CONTACTS' | '';
    options:
        | ''
        | 'INCLUDES_IGNORE_CASE'
        | 'INCLUDES_MATCH_CASE'
        | 'EXACT_IGNORE_CASE'
        | 'EXACT_MATCH_CASE';
    shared_contact_cards: ContactCard[];
    attachments: string[];
};
