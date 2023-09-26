import countries from './countries.json';

export const DATABASE_URL = process.env.DATABASE_URL as string;

export const IS_PRODUCTION = process.env.MODE === 'production';
export const IS_UAT = process.env.MODE === 'uat';

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

export const TAX = 0;
export const BASE_AMOUNT = 2500;
