import APIInstance from '../config/APIInstance';

export default class ShortenerService {
    static async getShortenedURL(number: string, message: string) {
        try {
            const { data } = await APIInstance.post(
                `/shortner/create-whatsapp-link`,
                {
                    number,
                    message,
                }
            );
            return data;
        } catch (err) {
            return null;
        }
    }

    static async createLink(link: string) {
        try {
            const { data } = await APIInstance.post(`/shortner/create-link`, {
                link,
            });
            return {
                link: data.link as string,
                image: data.base64 as string,
            };
        } catch (err) {
            return null;
        }
    }
}
