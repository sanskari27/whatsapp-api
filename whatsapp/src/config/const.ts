import countries from './countries.json';

export const PORT = process.env.PORT || 9000;
export const IS_PRODUCTION = (process.env.MODE || 'development') === 'production';
export const CHROME = process.env.CHROME || '';
export const DATABASE_URL = process.env.DATABASE_URL as string;

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

export const SESSION_STARTUP_WAIT_TIME = 5 * 60 * 1000; //milis
