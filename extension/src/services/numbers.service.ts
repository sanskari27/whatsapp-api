import APIInstance from '../config/APIInstance';

export default class NumbersValidatorService {
	static async validateNumbers(data: {
		filename?: string;
		type: 'NUMBERS' | 'CSV';
		numbers?: string[];
	}) {
		try {
			const { data: response } = await APIInstance.post(`/whatsapp/validate-numbers`, data);
			return response.contacts as {
				name: string;
				number: string;
				isBusiness: string;
				public_name: string;
				country: string;
			}[];
		} catch (err) {
			return [];
		}
	}
}
