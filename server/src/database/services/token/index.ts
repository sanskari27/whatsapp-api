import crypto from 'crypto';
import StorageDB from '../../repository/storage';

const TOKEN = 'token';

export default class TokenService {
	private constructor() {}

	static async createToken() {
		const code = crypto.randomBytes(3).toString('hex');
		StorageDB.setString(TOKEN, code);
		return code;
	}

	static async getToken(): Promise<string | null> {
		const code = await StorageDB.getString(TOKEN);
		return code;
	}

	static async validateToken(code: string): Promise<boolean> {
		const token = await StorageDB.getString(TOKEN);
		return token === code;
	}
}
