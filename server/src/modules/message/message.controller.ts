import { NextFunction, Request, Response } from 'express';
import { SOCKET_RESPONSES, TASK_RESULT_TYPE, TASK_TYPE } from '../../config/const';
import { APIError, PAYMENT_ERRORS, USER_ERRORS } from '../../errors';
import SocketServerProvider from '../../provider/socket';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import { CampaignService, GroupMergeService, TaskService, UploadService } from '../../services';
import { Respond } from '../../utils/ExpressUtils';
import MessagesUtils from '../../utils/Messages';
import WhatsappUtils from '../../utils/WhatsappUtils';
import { FileUtils } from '../../utils/files';
import { ScheduleMessageValidationResult } from './message.validator';

export async function scheduleMessage(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const req_data = req.locals.data as ScheduleMessageValidationResult;
	const {
		type,
		group_ids,
		label_ids,
		csv_file,
		variables,
		message,
		attachments,
		contacts,
		polls,
		numbers: requestedNumberList,
	} = req_data;

	let messages: string[] = [];
	let numbers: string[] = [];
	let _attachments:
		| {
				id: string;
				caption: string;
		  }[][]
		| null = null;

	const { isSubscribed } = await req.locals.account.isSubscribed();

	if (!isSubscribed) {
		return next(new APIError(PAYMENT_ERRORS.PAYMENT_REQUIRED));
	}

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	const taskService = new TaskService(account);
	const task_id = await taskService.createTask(TASK_TYPE.SCHEDULE_CAMPAIGN, TASK_RESULT_TYPE.NONE, {
		description: req_data.campaign_name,
	});

	Respond({
		res,
		status: 201,
	});

	const groupMergeService = new GroupMergeService(account);

	const uploadService = new UploadService(account);
	const uploaded_attachments = await uploadService.listAttachments(attachments);

	if (type === 'NUMBERS') {
		numbers = await whatsappUtils.getNumberIds(requestedNumberList as string[]);
	} else if (type === 'CSV') {
		const csv = await uploadService.getCSVFile(csv_file);
		if (!csv) {
			return taskService.markFailed(task_id);
		}
		const parsed_csv = await FileUtils.readCSV(csv);
		if (!parsed_csv) {
			return taskService.markFailed(task_id);
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
			const _group_ids = await groupMergeService.extractWhatsappGroupIds(group_ids);
			numbers = (
				await Promise.all(_group_ids.map((id) => whatsappUtils.getParticipantsChatByGroup(id)))
			).flat();
		} catch (err) {
			return taskService.markFailed(task_id);
		}
	} else if (type === 'GROUP') {
		try {
			const _group_ids = await groupMergeService.extractWhatsappGroupIds(group_ids);
			numbers = await whatsappUtils.getChatIds(_group_ids);
		} catch (err) {
			return taskService.markFailed(task_id);
		}
	} else if (type === 'LABEL') {
		try {
			numbers = (
				await Promise.all(label_ids.map((id) => whatsappUtils.getChatIdsByLabel(id)))
			).flat();
		} catch (err) {
			return taskService.markFailed(task_id);
		}
	}

	const sendMessageList = numbers.map(async (number, index) => {
		const _message = type === 'CSV' ? messages[index] : message ?? '';
		const attachments = type === 'CSV' ? _attachments![index] : uploaded_attachments;
		return {
			number,
			message: _message,
			attachments: attachments.map((a) => a.id),
			captions: attachments.map((a) => a.caption ?? ''),
			contacts: contacts,
			polls: polls,
		};
	});

	try {
		const campaignService = new CampaignService(account);
		const campaign_exists = await campaignService.alreadyExists(req_data.campaign_name);
		if (campaign_exists) {
			return taskService.markFailed(task_id);
		}
		const campaign = await campaignService.scheduleCampaign(await Promise.all(sendMessageList), {
			...req_data,
			description: req_data.description,
			startsFrom: req_data.startDate,
			startTime: req_data.startTime,
			endTime: req_data.endTime,
			devices: req_data.devices,
		});

		taskService.markCompleted(task_id, campaign.id);
		SocketServerProvider.attachedSockets
			.get(account.username)
			?.emit(SOCKET_RESPONSES.TASK_COMPLETED, task_id.toString());
	} catch (err) {
		taskService.markFailed(task_id);
		SocketServerProvider.attachedSockets
			.get(account.username)
			?.emit(SOCKET_RESPONSES.TASK_FAILED, task_id.toString());
	}
}

const MessageController = {
	scheduleMessage,
};

export default MessageController;
