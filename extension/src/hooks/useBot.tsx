import { useEffect, useState } from 'react';
import BotService, { BotDetails } from '../services/bot.service';

export default function useBot() {
	const [addingBot, setAddingBot] = useState(false);
	const [isLoading, setLoading] = useState(false);
	const [bots, setBots] = useState<BotDetails[]>([]);

	useEffect(() => {
		setLoading(true);
		BotService.listBots()
			.then(setBots)
			.finally(() => setLoading(false));
	}, []);

	const add = (data: {
		trigger: string;
		message: string;
		respond_to: string;
		trigger_gap_seconds: number;
		options: string;
		shared_contact_cards: string[];
		attachments: string[];
	}) => {
		return new Promise<void>((resolve) => {
			setAddingBot(true);
			BotService.createBot(data)
				.then((res) => {
					if (!res) return;
					setBots((prev) => [...prev, res]);
				})
				.finally(() => {
					setAddingBot(false);
					resolve();
				});
		});
	};

	const deleteBot = (id: string) => {
		BotService.deleteBot(id).then((res) => {
			if (res) {
				setBots((prev) => prev.filter((bot) => bot.bot_id !== id));
			}
		});
	};

	return { addingBot, add, bots, isLoading, deleteBot };
}
