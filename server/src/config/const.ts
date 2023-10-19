import countries from './countries.json';

export const DATABASE_URL = process.env.DATABASE_URL as string;

export const CHROMIUM_PATH = process.env.CHROMIUM_PATH as string;

export const IS_PRODUCTION = process.env.MODE === 'production';

export const PORT = process.env.PORT !== undefined ? process.env.PORT : undefined;

export enum SOCKET_EVENTS {
	INITIALIZE = 'initialize',
}

export enum SOCKET_RESPONSES {
	INITIALIZED = 'initialized',
	QR_GENERATED = 'qr-generated',
	WHATSAPP_AUTHENTICATED = 'whatsapp-authenticated',
	WHATSAPP_READY = 'whatsapp-ready',
	WHATSAPP_CLOSED = 'whatsapp-closed',
}

export const COUNTRIES: {
	[key: string]: string;
} = countries;

export enum WALLET_TRANSACTION_STATUS {
	SUCCESS = 'success',
	FAILED = 'failed',
	PENDING = 'pending',
	CANCELLED = 'cancelled',
}
export enum BOT_TRIGGER_OPTIONS {
	INCLUDES_IGNORE_CASE = 'INCLUDES_IGNORE_CASE',
	INCLUDES_MATCH_CASE = 'INCLUDES_MATCH_CASE',
	EXACT_IGNORE_CASE = 'EXACT_IGNORE_CASE',
	EXACT_MATCH_CASE = 'EXACT_MATCH_CASE',
}
export enum BOT_TRIGGER_TO {
	ALL = 'ALL',
	SAVED_CONTACTS = 'SAVED_CONTACTS',
	NON_SAVED_CONTACTS = 'NON_SAVED_CONTACTS',
}

export const TAX = 0;
export const BASE_AMOUNT = 2500;

export const UPLOADS_PATH = '/static/uploads/';
export const CSV_PATH = '/static/csv/';
export const ATTACHMENTS_PATH = '/static/attachments/';

export const PROMOTIONAL_MESSAGE = 'Powered by Whatsleads.in';

export const SESSION_STARTUP_WAIT_TIME = 5 * 60 * 1000; //milis
export const CACHE_TIMEOUT = 5 * 60; //seconds

export const CACHE_TOKEN_GENERATOR = {
	SAVED_CONTACTS: (client_id: string) => `SAVED_CONTACTS?client_id=${client_id}`,
	NON_SAVED_CONTACTS: (client_id: string) => `NON_SAVED_CONTACTS?client_id=${client_id}`,
	GROUPS: (client_id: string) => `GROUPS?client_id=${client_id}`,
	LABELS: (client_id: string) => `LABELS?client_id=${client_id}`,
	MAPPED_CONTACTS: (client_id: string) => `MAPPED_CONTACTS?client_id=${client_id}`,
	GROUPS_EXPORT: (client_id: string, group_id: string) =>
		`GROUPS_EXPORT?client_id=${client_id}&group_id=${group_id}`,
	LABELS_EXPORT: (client_id: string, label_id: string) =>
		`LABELS_EXPORT?client_id=${client_id}&label_id=${label_id}`,
};
