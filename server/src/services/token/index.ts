import crypto from 'crypto';
import StorageDB from '../../repository/storage';

const TOKEN = 'token';
const PROMOTIONAL_MESSAGE = 'promotional-message';

export default class TokenService {
	private constructor() {}

	static async createToken(code?: string) {
		if (!code) {
			code = crypto.randomBytes(3).toString('hex').toUpperCase();
		}
		StorageDB.setString(TOKEN, code);
		return code;
	}

	static async getToken(): Promise<string | null> {
		const code = await StorageDB.getString(TOKEN);
		return code;
	}

	static async getPromotionalMessage(): Promise<{ message_1: string; message_2: string }> {
		const message: any = await StorageDB.getObject(PROMOTIONAL_MESSAGE);
		if (!message) {
			return {
				message_1: '',
				message_2: '',
			};
		}
		return {
			message_1: message.message_1,
			message_2: message.message_2,
		};
	}

	static async setPromotionalMessage({
		message_1,
		message_2,
	}: {
		message_1: string;
		message_2: string;
	}) {
		await StorageDB.setObject(PROMOTIONAL_MESSAGE, { message_1, message_2 });
	}

	static async validateToken(code: string): Promise<boolean> {
		const token = await StorageDB.getString(TOKEN);
		return token === code;
	}
}
