export type LinkShortenerState = {
    link: string;
    number: string;
    message: string;
    list: Array<{
        link: string;
        base64: string;
    }>;
};
