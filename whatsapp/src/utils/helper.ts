import crypto from 'crypto';
import type { JSONObject } from './JSONUtils';
import JSONUtils from './JSONUtils';

export const Delay = async (seconds: number) => {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(null);
		}, seconds * 1000);
	});
};
export function getDataFromReq(req: Request) {
	const url = new URL(req.url);
	const searchParams = new URLSearchParams(url.search);
	const obj: JSONObject = {};
	for (const [name, value] of searchParams.entries()) {
		obj[name] = value;
	}
	const [valid, data] = JSONUtils.getJSON(JSON.stringify(obj));
	if (!valid) {
		return {
			client_id: '',
			action: '',
		} as JSONObject;
	}
	return data;
}

export function generateID() {
	return crypto.randomUUID();
}
