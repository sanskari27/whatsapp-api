import { PRIVACY_TYPE, TRANSACTION_STATUS } from '../config/const';

declare const chrome: any;

export async function getActiveTabURL() {
	const tabs = await chrome.tabs.query({
		currentWindow: true,
		active: true,
	});

	return tabs[0];
}

export function resetChromeData() {
	chrome.storage.sync.set({
		[PRIVACY_TYPE.RECENT]: false,
		[PRIVACY_TYPE.NAME]: false,
		[PRIVACY_TYPE.PHOTO]: false,
		[PRIVACY_TYPE.CONVERSATION]: false,
	});
}

export function saveChromeData(key: keyof typeof PRIVACY_TYPE, data: boolean) {
	chrome.storage.sync.set({
		[key]: data,
	});
}
export function saveTransactionData(transaction_id: string) {
	chrome.storage.sync.set({
		TRANSACTION_RECORD: transaction_id,
	});
}
export function getTransactionData() {
	return new Promise((resolve: (id: string) => void, reject) => {
		chrome.storage.sync.get('TRANSACTION_RECORD', (data: any) => {
			if (chrome.runtime.lastError) {
				return resolve('');
			} else {
				return resolve(data.TRANSACTION_RECORD as string);
			}
		});
	});
}

export function saveClientID(data: string) {
	chrome.storage.sync.set({
		client_id: data,
	});
}

export function getClientID() {
	return new Promise((resolve: (id: string) => void, reject) => {
		chrome.storage.sync.get('client_id', (data: any) => {
			if (chrome.runtime.lastError) {
				return resolve('');
			} else {
				return resolve(data.client_id as string);
			}
		});
	});
}

export function getChromeData(key: keyof typeof PRIVACY_TYPE) {
	return new Promise((resolve: (hidden: boolean) => void, reject) => {
		chrome.storage.sync.get(key, (data: any) => {
			if (chrome.runtime.lastError) {
				return resolve(false);
			} else {
				return resolve(data[key] as boolean);
			}
		});
	});
}
