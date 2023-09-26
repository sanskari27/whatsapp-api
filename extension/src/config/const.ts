export const SERVER_URL = 'http://localhost:8282/';
export const WEBPAGE_URL = 'http://localhost:5173/';
export const NAVIGATION = {
	WELCOME: '/welcome',
	HOME: '/home',
	CHECKOUT: '/checkout',
	FEATURES: '/features',
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
	LABEL = 'LABEL',
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
