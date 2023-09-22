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
    chrome.tabs.get(activeInfo.tabId, function (tab: any) {
        if (tab.url === 'https://web.whatsapp.com/') {
            hideRecentCSSGenerator(activeInfo.tabId, recent);
            hideConversationCSSGenerator(activeInfo.tabId, conversation);
            hidePhotoCSSGenerator(activeInfo.tabId, photo);
            hideNameCSSGenerator(activeInfo.tabId, name);
        }
    })
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
				// saveChromeData(PRIVACY_TYPE.RECENT, value);
				hideRecentCSSGenerator(tabId, value);
			} else if (type === PRIVACY_TYPE.CONVERSATION) {
				// saveChromeData(PRIVACY_TYPE.CONVERSATION, value);
				hideConversationCSSGenerator(tabId, value);
			} else if (type === PRIVACY_TYPE.PHOTO) {
				// saveChromeData(PRIVACY_TYPE.PHOTO, value);
				hidePhotoCSSGenerator(tabId, value);
			} else if (type === PRIVACY_TYPE.NAME) {
				// saveChromeData(PRIVACY_TYPE.NAME, value);
				hideNameCSSGenerator(tabId, value);
			} else {
				return;
			}
			sendResponse({ success: true });
		}
	}
);

chrome.tabs.onUpdated.addListener(async(tabId: any, changeInfo: any, tab: any) => {
    if (changeInfo.status == "loading") {
        const url: any = tab.url;
        const promises = [
            getChromeData(PRIVACY_TYPE.RECENT),
            getChromeData(PRIVACY_TYPE.NAME),
            getChromeData(PRIVACY_TYPE.PHOTO),
            getChromeData(PRIVACY_TYPE.CONVERSATION),
        ];
        const [recent, name, photo, conversation] = await Promise.all(promises);
        if (url=='https://web.whatsapp.com/') {
            hideRecentCSSGenerator(tab.id, recent);
            hideConversationCSSGenerator(tab.id, conversation);
            hidePhotoCSSGenerator(tab.id, photo);
            hideNameCSSGenerator(tab.id, name);
        }
    }
});

function hideRecentCSSGenerator(tabID: string, blurred: boolean) {
	const css = `div[class="_2KKXC"] {filter:blur(${blurred ? '5px' : '0px'})!important;}`;
	chrome.scripting.insertCSS({
		target: { tabId: tabID },
		css: css,
	});
}

function hideConversationCSSGenerator(tabID: string, blurred: boolean) {
	const css = `div[class*="CzM4m"] {filter:blur(${blurred ? '10px' : '0px'})!important;}`;
	chrome.scripting.insertCSS({
		target: { tabId: tabID },
		css: css,
	});
}

function hidePhotoCSSGenerator(tabID: string, blurred: boolean) {
	const css = `div[class*="_1AHcd"] {filter:blur(${blurred ? '10px' : '0px'})!important;}`;
	const css_header = `div[class*="_2pr2H"] {filter:blur(${blurred ? '10px' : '0px'})!important;}`;
	chrome.scripting.insertCSS({
		target: { tabId: tabID },
		css: css,
	});
	chrome.scripting.insertCSS({
		target: { tabId: tabID },
		css: css_header,
	});
}

function hideNameCSSGenerator(tabID: string, blurred: boolean) {
	const css = `div[class*="_21S-L"] {filter:blur(${blurred ? '10px' : '0px'})!important;}`;
	const css_header = `div[class*="_2au8k"] {filter:blur(${blurred ? '10px' : '0px'})!important;}`;
	chrome.scripting.insertCSS({
		target: { tabId: tabID },
		css: css,
	});
	chrome.scripting.insertCSS({
		target: { tabId: tabID },
		css: css_header,
	});
}
