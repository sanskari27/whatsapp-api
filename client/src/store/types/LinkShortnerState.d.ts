export type LinkShortenerState = {
    link: string;
    number: string;
    message: string;
    list: Array<{
        shorten_link: string;
        link: string;
        base64: string;
        id: string;
    }>;
    generatedLink: string;
    generatedImage: string;

    generatingLink: boolean;
    shorteningLink: boolean;
    linkCopied: boolean;
};
