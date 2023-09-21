import jsonData from "./const.json";

declare const chrome: any;

chrome.runtime.onInstalled.addListener((details: any) => {
    // Set the predefined data (array of JSON objects) to Chrome Extension storage
    chrome.storage.sync.set({ privacy: jsonData });
});

chrome.runtime.onMessage.addListener(
    async (message: any, sender: any, sendResponse: any) => {
        if (message.action === "storeData") {
            chrome.storage.sync.set({ siteData: message.data.siteData });
            sendResponse({ success: true });
        }
    }
);

function getSyncData(key: string) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, (data: any) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data);
            }
        });
    });
}

// chrome.tabs.onActivated.addListener(async (activeInfo: any) => {
//     const siteData: any = await getSyncData("siteData");

// })

chrome.runtime.onMessage.addListener(
    async (message: any, sender: any, sendResponse: any) => {
        if (message.url == "https://web.whatsapp.com/") {
            if (message.action === "recent") {
                const hideRecent=toggleRecent(message.data)
                chrome.scripting.insertCSS({
                    target: { tabId: message.tabId },
                    css: hideRecent,
                });
                sendResponse({ status: true });
            }
        }
    })

const toggleRecent = (toggle: boolean) =>
    `div[class="_2KKXC"] {filter:blur(${toggle ? "100px" : "0px"})!important;}`;