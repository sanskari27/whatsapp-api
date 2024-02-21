import { NextFunction, Request, Response } from 'express';
import WhatsappProvider from '../../providers/whatsapp';
import { NumberWithId } from '../../types/responses';
import { Respond } from '../../utils/ExpressUtils';

async function numbers(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const numbers = req.body.numbers as string[];

	if (!numbers) {
		return res.status(400).send('INVALID_FIELD');
	}
	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return res.status(400).send('NOT_READY');
	}

	try {
		const numbersPromise = numbers.map(async (number) => {
			try {
				const numberID = await whatsapp.getClient().getNumberId(number);
				if (!numberID) {
					return null;
				}
				return {
					id: numberID._serialized,
					number: numberID.user,
				};
			} catch (err) {
				return null;
			}
		});

		const list = (await Promise.all(numbersPromise)).filter(
			(number) => number !== null
		) as NumberWithId[];

		return Respond({
			res,
			status: 200,
			data: list,
		});
	} catch (err) {
		return res.status(500).send('INTERNAL_SERVER_ERROR');
	}
}

const NumbersController = {
	numbers,
};

export default NumbersController;
