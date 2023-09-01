import crypto from 'crypto';

export function generateClientID() {
	return crypto.randomUUID();
}
