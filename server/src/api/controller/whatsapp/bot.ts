import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { BOT_TRIGGER_OPTIONS, BOT_TRIGGER_TO } from '../../../config/const';
import BotService from '../../../database/services/bot';
import UploadService from '../../../database/services/uploads';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import InternalError, {
    INTERNAL_ERRORS,
} from '../../../errors/internal-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import { Respond, idValidator } from '../../../utils/ExpressUtils';
import VCardBuilder from '../../../utils/VCardBuilder';

async function allBots(req: Request, res: Response, next: NextFunction) {
    const botService = new BotService(req.locals.user);
    const bots = await botService.allBots();

    return Respond({
        res,
        status: 200,
        data: {
            bots: bots,
        },
    });
}

async function createBot(req: Request, res: Response, next: NextFunction) {
    const client_id = req.locals.client_id;

    const whatsapp = WhatsappProvider.getInstance(client_id);
    if (!whatsapp.isReady()) {
        return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
    }

    const reqValidator = z.object({
        trigger: z.string().default(''),
        message: z.string().trim().default(''),
        respond_to: z.enum([
            BOT_TRIGGER_TO.ALL,
            BOT_TRIGGER_TO.SAVED_CONTACTS,
            BOT_TRIGGER_TO.NON_SAVED_CONTACTS,
        ]),
        trigger_gap_seconds: z.number().positive().default(1),
        options: z.enum([
            BOT_TRIGGER_OPTIONS.EXACT_IGNORE_CASE,
            BOT_TRIGGER_OPTIONS.EXACT_MATCH_CASE,
            BOT_TRIGGER_OPTIONS.INCLUDES_IGNORE_CASE,
            BOT_TRIGGER_OPTIONS.INCLUDES_MATCH_CASE,
        ]),
        shared_contact_cards: z
            .object({
                first_name: z.string().default(''),
                last_name: z.string().default(''),
                title: z.string().default(''),
                organization: z.string().default(''),
                email_personal: z.string().default(''),
                email_work: z.string().default(''),
                contact_number_phone: z.string().default(''),
                contact_number_work: z.string().default(''),
                contact_number_other: z.string().array().default([]),
                links: z.string().array().default([]),
                street: z.string().default(''),
                city: z.string().default(''),
                state: z.string().default(''),
                country: z.string().default(''),
                pincode: z.string().default(''),
            })
            .array()
            .default([]),
        attachments: z
            .string()
            .array()
            .default([])
            .refine(
                (attachments) =>
                    !attachments.some((value) => !Types.ObjectId.isValid(value))
            )
            .transform((attachments) =>
                attachments.map((value) => new Types.ObjectId(value))
            ),
    });

    const reqValidatorResult = reqValidator.safeParse(req.body);
    if (!reqValidatorResult.success) {
        return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
    }

    const botService = new BotService(req.locals.user);
    const data = reqValidatorResult.data;
    const [_, media_attachments] = await new UploadService(
        req.locals.user
    ).listAttachments(reqValidatorResult.data.attachments);

    const contact_cards_promise = data.shared_contact_cards.map(
        async (detail) => {
            const vcard = new VCardBuilder(detail)
                .setFirstName(detail.first_name)
                .setLastName(detail.last_name)
                .setTitle(detail.title)
                .setOrganization(detail.organization)
                .setEmail(detail.email_personal)
                .setWorkEmail(detail.email_work)
                .setStreet(detail.street)
                .setCity(detail.city)
                .setState(detail.state)
                .setPincode(detail.pincode)
                .setCountry(detail.country);

            if (detail.contact_number_phone) {
                const number = detail.contact_number_phone.startsWith('+')
                    ? detail.contact_number_phone.substring(1)
                    : detail.contact_number_phone;
                const numberId = await whatsapp.getClient().getNumberId(number);
                if (numberId) {
                    vcard.setContactPhone(`+${numberId.user}`, numberId.user);
                } else {
                    vcard.setContactPhone(`+${number}`);
                }
            }

            if (detail.contact_number_work) {
                const number = detail.contact_number_work.startsWith('+')
                    ? detail.contact_number_work.substring(1)
                    : detail.contact_number_work;
                const numberId = await whatsapp.getClient().getNumberId(number);
                if (numberId) {
                    vcard.setContactWork(`+${numberId.user}`, numberId.user);
                } else {
                    vcard.setContactWork(`+${number}`);
                }
            }

            for (const number of detail.contact_number_other) {
                const formattedNumber = number.startsWith('+')
                    ? number.substring(1)
                    : number;
                const numberId = await whatsapp
                    .getClient()
                    .getNumberId(formattedNumber);
                if (numberId) {
                    vcard.addContactOther(`+${numberId.user}`, numberId.user);
                } else {
                    vcard.addContactOther(`+${formattedNumber}`);
                }
            }
            console.log(detail.links);
            for (let i = 0; i < detail.links.length - 1; i++) {
                vcard.addLink(detail.links[i]);
            }
            // for (const link of detail.links) {
            //     console.log(link);
            //     // const formattedLink = link.startsWith('https://')
            //     //     ? link
            //     //     : `https://${link}`;
            //     vcard.addLink(link);
            // }

            return vcard.build();
        }
    );

    const contact_cards = await Promise.all(contact_cards_promise);

    const bot = botService.createBot({
        ...reqValidatorResult.data,
        shared_contact_cards: contact_cards,
        attachments: media_attachments,
    });

    return Respond({
        res,
        status: 201,
        data: {
            bot,
        },
    });
}
async function toggleActive(req: Request, res: Response, next: NextFunction) {
    const [isIDValid, id] = idValidator(req.params.id);

    if (!isIDValid) {
        return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
    }

    try {
        const botService = new BotService(req.locals.user);
        const bot = await botService.toggleActive(id);

        return Respond({
            res,
            status: 200,
            data: {
                bot: bot,
            },
        });
    } catch (err) {
        if (err instanceof InternalError) {
            if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND)) {
                return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
            }
        }
        return next(
            new APIError(API_ERRORS.COMMON_ERRORS.INTERNAL_SERVER_ERROR)
        );
    }
}
async function deleteBot(req: Request, res: Response, next: NextFunction) {
    const [isIDValid, id] = idValidator(req.params.id);

    if (!isIDValid) {
        return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
    }

    const botService = new BotService(req.locals.user);
    botService.deleteBot(id);

    return Respond({
        res,
        status: 200,
        data: {},
    });
}

const BotController = {
    allBots,
    createBot,
    toggleActive,
    deleteBot,
};

export default BotController;
