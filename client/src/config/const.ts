import countries from './countries.json';

// export const SERVER_URL = 'https://api.whatsleads.in/';
// export const WEBPAGE_URL = 'https://whatsleads.in/';
export const SERVER_URL = 'http://localhost:8282/';
// export const SERVER_URL = 'http://178.16.138.2:8282/';
export const WEBPAGE_URL = 'http://localhost:3000/';

export const NAVIGATION = {
    WELCOME: '/welcome',
    HOME: '/',
    EXPORTS: '/exports',
    SCHEDULER: '/scheduler',
    BOT: '/bot',
    SETTINGS: '/settings',
    NETWORK_ERROR: '/network-error',
    REPORTS: '/reports',
};

export enum CHROME_ACTION {
    PRIVACY_UPDATED = 'PRIVACY_UPDATED',
    OPEN_URL = 'OPEN_URL',
}

export enum PRIVACY_TYPE {
    RECENT = 'RECENT',
    NAME = 'NAME',
    PHOTO = 'PHOTO',
    CONVERSATION = 'CONVERSATION',
}

export enum EXPORTS_TYPE {
    ALL = 'ALL',
    SAVED = 'SAVED',
    UNSAVED = 'UNSAVED',
    GROUP = 'GROUP',
    GROUP_ALL = 'GROUP_ALL',
    LABEL = 'LABEL',
    LABEL_ALL = 'LABEL_ALL',
}

export enum TRANSACTION_STATUS {
    CODE = 'CODE',
    CHECKING_COUPON = 'CHECKING_COUPON',
    COUPON_VALID = 'COUPON_VALID',
    COUPON_ERROR = 'COUPON_ERROR',
    TRANSACTION_ID = 'TRANSACTION_ID',
    GROSS_AMOUNT = 'GROSS_AMOUNT',
    TAX = 'TAX',
    DISCOUNT = 'DISCOUNT',
    TOTAL_AMOUNT = 'TOTAL_AMOUNT',
    TRANSACTION_ERROR = 'TRANSACTION_ERROR',
}

export enum SOCKET_EVENT {
    INITIALIZE = 'initialize',
    INITIALIZED = 'initialized',
    QR_GENERATED = 'qr-generated',
    WHATSAPP_AUTHENTICATED = 'whatsapp-authenticated',
    WHATSAPP_READY = 'whatsapp-ready',
    WHATSAPP_CLOSED = 'whatsapp-closed',
    PAYMENT_SUCCESS = 'payment-success',
}

export enum SETTINGS {
    NAME = 'NAME',
    PHONE_NUMBER = 'PHONE_NUMBER',
    IS_SUBSCRIBED = 'IS_SUBSCRIBED',
    SUBSCRIPTION_EXPIRATION = 'SUBSCRIPTION_EXPIRATION',
    USER_TYPE = 'USER_TYPE',
    PAYMENT_RECORDS = 'PAYMENT_RECORDS',
}

export const COUNTRIES: {
    [country_code: string]: string;
} = countries;
