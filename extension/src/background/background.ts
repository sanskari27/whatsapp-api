import { CHROME_ACTION, PRIVACY_TYPE } from '../config/const';
import { getChromeData, resetChromeData, saveChromeData } from '../utils/ChromeUtils';

declare const chrome: any;

export type MessageProps = {
	action: string;
	url: string;
	tabId: string;
	data: {
		[key: string]: any;
	};
};

chrome.runtime.onInstalled.addListener((details: any) => {
	resetChromeData();
});

chrome.tabs.onActivated.addListener(async (activeInfo: any) => {
	const promises = [
		getChromeData(PRIVACY_TYPE.RECENT),
		getChromeData(PRIVACY_TYPE.NAME),
		getChromeData(PRIVACY_TYPE.PHOTO),
		getChromeData(PRIVACY_TYPE.CONVERSATION),
	];
	const [recent, name, photo, conversation] = await Promise.all(promises);
	hideRecentCSSGenerator(activeInfo.tabId, recent);
});

chrome.runtime.onMessage.addListener(
	async (message: MessageProps, sender: any, sendResponse: any) => {
		if (message.url !== 'https://web.whatsapp.com/') {
			return;
		}
		if (message.action === CHROME_ACTION.PRIVACY_UPDATED) {
			const { type, value } = message.data;
			const tabId = message.tabId;
			if (type === PRIVACY_TYPE.RECENT) {
				saveChromeData(PRIVACY_TYPE.RECENT, value);
				hideRecentCSSGenerator(tabId, value);
			}

			saveChromeData(type, value);
			sendResponse({ success: true });
		}
	}
);

function hideRecentCSSGenerator(tabID: string, blurred: boolean) {
	const css = `div[class="_2KKXC"] {filter:blur(${blurred ? '5px' : '0px'})!important;}`;
	chrome.scripting.insertCSS({
		target: { tabId: tabID },
		css: css,
	});
}
