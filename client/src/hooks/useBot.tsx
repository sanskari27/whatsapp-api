import { useEffect, useState } from 'react';
import BotService, { BotDetails } from '../services/bot.service';

export default function useBot() {
    const [addingBot, setAddingBot] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [bots, setBots] = useState<BotDetails[]>([]);

    useEffect(() => {
        setLoading(true);
        BotService.listBots()
            .then((res) => {
                if (!res) return;
                setBots(
                    res.map((bot_response) => ({
                        trigger_gap_seconds:
                            bot_response.trigger_gap_seconds || 0,
                        response_delay_seconds:
                            bot_response.response_delay_seconds || 0,
                        options: bot_response.options || '',
                        shared_contact_cards:
                            bot_response.shared_contact_cards || [],
                        attachments: bot_response.attachments || [],
                        bot_id: bot_response.bot_id || '',
                        trigger: bot_response.trigger || '',
                        isActive: bot_response.isActive || false,
                        message: bot_response.message || '',
                        respond_to: bot_response.respond_to || '',
                    }))
                );
            })
            .finally(() => setLoading(false));
    }, []);

    const add = (data: {
        trigger: string;
        message: string;
        respond_to: string;
        trigger_gap_seconds: number;
        response_delay_seconds: number;
        options: string;
        shared_contact_cards: string[];
        attachments: string[];
    }) => {
        return new Promise<void>((resolve) => {
            setAddingBot(true);
            BotService.createBot(data)
                .then((res) => {
                    if (!res) return;
                    setBots((prev) => [
                        ...prev,
                        {
                            trigger_gap_seconds: res.trigger_gap_seconds || 0,
                            response_delay_seconds:
                                res.response_delay_seconds || 0,
                            options: res.options || '',
                            shared_contact_cards:
                                res.shared_contact_cards || [],
                            attachments: res.attachments || [],
                            bot_id: res.bot_id || '',
                            trigger: res.trigger || '',
                            isActive: res.isActive || false,
                            message: res.message || '',
                            respond_to: res.respond_to || '',
                        },
                    ]);
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

    const editBot = (
        id: string,
        data: {
            trigger: string;
            message: string;
            respond_to: string;
            trigger_gap_seconds: number;
            shared_contact_cards: string[];
            response_delay_seconds: number;
            options: string;
            attachments: string[];
        }
    ) => {
        return new Promise<void>((resolve) => {
            setAddingBot(true);
            BotService.updateBot(id, data)
                .then((res) => {
                    setAddingBot(false);
                    if (!res) return;
                    setBots((prev) =>
                        prev.map((bot) => {
                            if (bot.bot_id === id) {
                                return res;
                            }
                            return bot;
                        })
                    );
                })
                .finally(() => {
                    resolve();
                });
        });
    };

    const toggleBot = (id: string) => {
        BotService.toggleBot(id).then((res) => {
            if (!res) {
                return;
            }
            setBots((prev) =>
                prev.map((bot) => {
                    if (bot.bot_id === id) {
                        return res;
                    }
                    return bot;
                })
            );
        });
    };

    return { addingBot, add, bots, isLoading, deleteBot, editBot, toggleBot };
}
