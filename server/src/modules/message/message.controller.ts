import { NextFunction, Request, Response } from 'express';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { UserService } from '../../services';
import GroupMergeService from '../../services/merged-groups';
import CampaignService from '../../services/messenger/Campaign';
import UploadService from '../../services/uploads';
import { Respond } from '../../utils/ExpressUtils';
import MessagesUtils from '../../utils/Messages';
import WhatsappUtils from '../../utils/WhatsappUtils';
import { FileUtils } from '../../utils/files';
import { ScheduleMessageValidationResult } from './message.validator';

export async function scheduleMessage(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const req_data = req.locals.data as ScheduleMessageValidationResult;
	const {
		type,
		group_ids,
		label_ids,
		csv_file,
		variables,
		message,
		attachments,
		shared_contact_cards,
		polls,
		numbers: requestedNumberList,
	} = req_data;

	let messages: string[] = [];
	let numbers: string[] = [];
	let _attachments:
		| {
				filename: string;
				caption: string;
				name: string;
		  }[][]
		| null = null;

	const { isSubscribed, isNew } = new UserService(req.locals.user).isSubscribed();

	if (!isSubscribed && !isNew) {
		return next(new APIError(API_ERRORS.PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	const groupMergeService = new GroupMergeService(req.locals.user);

	const uploadService = new UploadService(req.locals.user);
	const [uploaded_attachments] = await uploadService.listAttachments(attachments);

	if (type === 'NUMBERS') {
		numbers = await whatsappUtils.getNumberIds(requestedNumberList as string[]);
	} else if (type === 'CSV') {
		const csv = await uploadService.getCSVFile(csv_file);
		if (!csv) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.NOT_FOUND));
		}
		const parsed_csv = await FileUtils.readCSV(csv);
		console.log(parsed_csv)
		if (!parsed_csv) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.ERROR_PARSING_CSV));
		}

		messages = [];
		_attachments = [];

		const promises = parsed_csv.map(async (row) => {
			const numberWithId = await whatsappUtils.getNumberWithId(row.number);
			if (!numberWithId) {
				return; // Skips to the next iteration
			}
			numbers.push(numberWithId.numberId);
			_attachments!.push(MessagesUtils.formatAttachments(uploaded_attachments, variables, row));
			messages?.push(MessagesUtils.formatMessageText(message, variables, row));
		});

		await Promise.all(promises);
	} else if (type === 'GROUP_INDIVIDUAL') {
		try {
			const merged_group_whatsapp_ids = await groupMergeService.extractWhatsappGroupIds(group_ids);
			numbers = (
				await Promise.all(
					merged_group_whatsapp_ids.map(
						async (id) => await whatsappUtils.getParticipantsChatByGroup(id as string)
					)
				)
			).flat();
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID));
		}
	} else if (type === 'GROUP') {
		try {
			const merged_group_whatsapp_ids = await groupMergeService.extractWhatsappGroupIds(group_ids);
			numbers = await whatsappUtils.getChatIds(merged_group_whatsapp_ids);
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.INVALID_GROUP_ID));
		}
	} else if (type === 'LABEL') {
		try {
			numbers = (
				await Promise.all(
					(label_ids as string[]).map(
						async (id) => await whatsappUtils.getChatIdsByLabel(id as string)
					)
				)
			).flat();
		} catch (err) {
			return next(new APIError(API_ERRORS.WHATSAPP_ERROR.BUSINESS_ACCOUNT_REQUIRED));
		}
	}

	const sendMessageList = numbers.map(async (number, index) => {
		const _message = type === 'CSV' ? messages[index] : message ?? '';
		const attachments = type === 'CSV' ? _attachments![index] : uploaded_attachments;
		return {
			number,
			message: _message,
			attachments: attachments,
			shared_contact_cards: shared_contact_cards,
			polls: polls,
		};
	});

	try {
		const campaignService = new CampaignService(req.locals.user);
		const campaign_exists = await campaignService.alreadyExists(req_data.campaign_name);
		if (campaign_exists) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.ALREADY_EXISTS);
		}
		const campaign = await campaignService.scheduleCampaign(await Promise.all(sendMessageList), {
			...req_data,
			description: req_data.description,
			startsFrom: req_data.startDate,
			startTime: req_data.startTime,
			endTime: req_data.endTime,
		});

		return Respond({
			res,
			status: 200,
			data: {
				message: `${campaign.messages.length} messages scheduled.`,
				campaign_id: campaign._id,
			},
		});
	} catch (err) {
		if (err instanceof InternalError) {
			if (err.isSameInstanceof(INTERNAL_ERRORS.COMMON_ERRORS.ALREADY_EXISTS)) {
				return next(new APIError(API_ERRORS.COMMON_ERRORS.ALREADY_EXISTS));
			}
		}
		next(new APIError(API_ERRORS.WHATSAPP_ERROR.MESSAGE_SENDING_FAILED, err));
	}
}

const MessageController = {
	scheduleMessage,
};

export default MessageController;
