import { GroupChat } from 'whatsapp-web.js';
import APIError, { API_ERRORS } from '../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../errors/internal-errors';
import { WhatsappProvider } from '../provider/whatsapp_provider';

export async function getChatIdsByNumbers(whatsapp: WhatsappProvider, numbers: string[]) {
	const numbersPromise = numbers.map(async (number) => {
		const numberID = await whatsapp.getClient().getNumberId(number);
		if (!numberID) {
			return null;
		}
		return numberID._serialized;
	});

	return (await Promise.all(numbersPromise)).filter((number) => number !== null) as string[];
}
export async function getChatIdsWithNumberByNumbers(whatsapp: WhatsappProvider, numbers: string[]) {
	const numbersPromise = numbers.map(async (number) => {
		const numberID = await whatsapp.getClient().getNumberId(number);
		if (!numberID) {
			return null;
		}
		return {
			number,
			numberId: numberID._serialized,
		};
	});

	return (await Promise.all(numbersPromise)).filter((number) => number !== null) as {
		number: string;
		numberId: string;
	}[];
}

export async function getChatIdsByGroup(whatsapp: WhatsappProvider, group_id: string) {
	const chat = await whatsapp.getClient().getChatById(group_id);
	if (!chat.isGroup) {
		throw new InternalError(INTERNAL_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID);
	}

	return (chat as GroupChat).participants.map((participant) => participant.id._serialized);
}

export async function getChatIdsByLabel(whatsapp: WhatsappProvider, label_id: string) {
	if (!whatsapp.isBusiness()) {
		throw new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED);
	}
	const chats = await whatsapp.getClient().getChatsByLabelId(label_id);

	return chats.map((chat) => chat.id._serialized);
}
