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
}
