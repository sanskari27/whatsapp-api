import { NextFunction, Request, Response } from 'express';
import { GroupChat, MessageMedia } from 'whatsapp-web.js';
import { getOrCache, saveToCache } from '../../config/cache';
import {
	CACHE_TOKEN_GENERATOR,
	SOCKET_RESPONSES,
	TASK_PATH,
	TASK_RESULT_TYPE,
	TASK_TYPE,
} from '../../config/const';
import { APIError, COMMON_ERRORS, USER_ERRORS } from '../../errors';
import SocketServerProvider from '../../provider/socket';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import GroupMergeService from '../../services/merged-groups';
import TaskService from '../../services/task';
import {
	TBusinessContact,
	TContact,
	TGroupBusinessContact,
	TGroupContact,
} from '../../types/whatsapp';
import CSVParser from '../../utils/CSVParser';
import { Respond, idValidator } from '../../utils/ExpressUtils';
import VCFParser from '../../utils/VCFParser';
import WhatsappUtils, { MappedContacts } from '../../utils/WhatsappUtils';
import {
	FileUpload,
	FileUtils,
	ONLY_JPG_IMAGES_ALLOWED,
	ResolvedFile,
	SingleFileUploadOptions,
} from '../../utils/files';
import {
	CreateGroupValidationResult,
	GroupSettingValidationResult,
	MergeGroupValidationResult,
} from './groups.validator';

async function groups(req: Request, res: Response, next: NextFunction) {
	const { account, client_id, device } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	try {
		const { groups } = await getOrCache(
			CACHE_TOKEN_GENERATOR.CONTACTS(device._id),
			async () => await whatsappUtils.getContacts()
		);

		const merged_groups = await new GroupMergeService(account).listGroups();

		return Respond({
			res,
			status: 200,
			data: {
				groups: [...groups, ...merged_groups.map((group) => ({ ...group, groups: undefined }))],
			},
		});
	} catch (err) {
		return next(new APIError(USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function refreshGroup(req: Request, res: Response, next: NextFunction) {
	const { account, client_id, device } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	try {
		const contacts = await whatsappUtils.getContacts();
		await saveToCache(CACHE_TOKEN_GENERATOR.CONTACTS(device._id), contacts);
		const merged_groups = await new GroupMergeService(account).listGroups();

		return Respond({
			res,
			status: 200,
			data: {
				groups: [
					...contacts.groups,
					...merged_groups.map((group) => ({ ...group, groups: undefined })),
				],
			},
		});
	} catch (err) {
		return next(new APIError(USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function exportGroups(req: Request, res: Response, next: NextFunction) {
	const { account, client_id, device } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);

	const { group_ids } = req.body as { group_ids: string[] };

	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	} else if (!Array.isArray(group_ids) || group_ids.length === 0) {
		return next(new APIError(COMMON_ERRORS.INVALID_FIELDS));
	}

	const taskService = new TaskService(req.locals.account);
	const options = {
		business_contacts_only: req.body.business_contacts_only ?? false,
		saved: req.body.saved ?? true,
		unsaved: req.body.unsaved ?? true,
		vcf: req.body.vcf ?? false,
	};

	const task_id = await taskService.createTask(
		TASK_TYPE.EXPORT_GROUP_CONTACTS,
		options.vcf ? TASK_RESULT_TYPE.VCF : TASK_RESULT_TYPE.CSV,
		{
			description: `Export ${group_ids.length} groups.`,
		}
	);

	Respond({
		res,
		status: 201,
	});
	try {
		const groupMergeService = new GroupMergeService(account);
		const merged_group_ids = group_ids.filter((id) => idValidator(id)[0]);
		const merged_group_whatsapp_ids = await groupMergeService.extractWhatsappGroupIds(
			merged_group_ids
		);

		const ids_to_export = [...group_ids, ...merged_group_whatsapp_ids].filter(
			(id) => !idValidator(id)[0] // check if all ids is valid whatsapp group ids
		);

		const saved_contacts = (
			await Promise.all(
				(
					await getOrCache(CACHE_TOKEN_GENERATOR.CONTACTS(device._id), async () =>
						whatsappUtils.getContacts()
					)
				).saved.map(async (contact) => ({
					...(await whatsappUtils.getContactDetails(contact)),
					...WhatsappUtils.getBusinessDetails(contact),
					isSaved: contact.isMyContact,
				}))
			)
		).reduce((acc, contact) => {
			acc[contact.number] = {
				name: contact.name ?? '',
				public_name: contact.public_name ?? '',
				number: contact.number ?? '',
				isBusiness: contact.isBusiness ?? 'Personal',
				country: contact.country ?? '',
				description: contact.description ?? '',
				email: contact.email ?? '',
				websites: contact.websites ?? [],
				latitude: contact.latitude ?? 0,
				longitude: contact.longitude ?? 0,
				address: contact.address ?? '',
				isSaved: contact.isSaved,
			};
			return acc;
		}, {} as MappedContacts);

		const groups = (
			await Promise.all(
				ids_to_export.map(async (group_id) => {
					try {
						const chat = await whatsapp.getClient().getChatById(group_id);
						if (!chat.isGroup) {
							throw new Error('Group not found');
						}
						return chat as GroupChat;
					} catch (err) {
						return null;
					}
				})
			)
		).filter((chat) => chat !== null) as GroupChat[];

		const participants = (
			await Promise.all(
				groups.map((groupChat) =>
					whatsappUtils.getGroupContacts(groupChat, {
						saved: options.saved,
						unsaved: options.unsaved,
						business_details: options.business_contacts_only,
						mapped_contacts: saved_contacts,
					})
				)
			)
		).flat();

		const data = options.vcf
			? options.business_contacts_only
				? VCFParser.exportBusinessContacts(participants as TBusinessContact[])
				: VCFParser.exportContacts(participants as TContact[])
			: options.business_contacts_only
			? CSVParser.exportGroupBusinessContacts(participants as TGroupBusinessContact[])
			: CSVParser.exportGroupContacts(participants as TGroupContact[]);

		const file_name = `Exported Contacts${options.vcf ? '.vcf' : '.csv'}`;

		const file_path = __basedir + TASK_PATH + task_id.toString() + (options.vcf ? '.vcf' : '.csv');

		await FileUtils.writeFile(file_path, data);

		taskService.markCompleted(task_id, file_name);

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

async function createGroup(req: Request, res: Response, next: NextFunction) {
	const { csv_file, name } = req.locals.data as CreateGroupValidationResult;

	const { account, client_id } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	try {
		const parsed_csv = await FileUtils.readCSV(csv_file);
		if (!parsed_csv) {
			return next(new APIError(COMMON_ERRORS.ERROR_PARSING_CSV));
		}

		const numberIds = (
			await Promise.all(
				parsed_csv.map(async (row) => {
					const numberWithId = await whatsappUtils.getNumberWithId(row.number);
					if (!numberWithId) {
						return null; // Skips to the next iteration
					}
					return numberWithId.numberId;
				})
			)
		).filter((number) => number) as string[];

		whatsappUtils.createGroup(name, numberIds);

		return Respond({
			res,
			status: 200,
			data: {
				message: 'Group created successfully',
			},
		});
	} catch (err) {
		return next(new APIError(USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function mergeGroup(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);

	const { group_ids, group_name, group_reply, private_reply } = req.locals
		.data as MergeGroupValidationResult;

	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	const chat_ids = (
		await Promise.all(
			group_ids.map(async (id) => {
				const chat = await whatsappUtils.getChat(id);
				if (!chat || !chat.isGroup) return null;
				return chat.id._serialized;
			})
		)
	).filter((chat) => chat !== null) as string[];

	const group = await new GroupMergeService(account).mergeGroup(group_name, chat_ids, {
		group_reply,
		private_reply,
	});

	return Respond({
		res,
		status: 200,
		data: {
			group: group,
		},
	});
}

async function updateMergedGroup(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const { group_ids, group_name, group_reply, private_reply } = req.locals
		.data as MergeGroupValidationResult;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	const chat_ids = (
		await Promise.all(
			group_ids.map(async (id) => {
				const chat = await whatsappUtils.getChat(id);
				if (!chat || !chat.isGroup) return null;
				return chat.id._serialized;
			})
		)
	).filter((chat) => chat !== null) as string[];

	const group = await new GroupMergeService(account).updateGroup(
		req.locals.id,
		{
			group_ids: chat_ids,
			name: group_name,
		},
		{
			group_reply,
			private_reply,
		}
	);

	return Respond({
		res,
		status: 200,
		data: {
			group,
		},
	});
}

async function mergedGroups(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	try {
		const merged_groups = await new GroupMergeService(account).listGroups();

		return Respond({
			res,
			status: 200,
			data: {
				groups: merged_groups,
			},
		});
	} catch (err) {
		return next(new APIError(USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function deleteMergedGroup(req: Request, res: Response, next: NextFunction) {
	const { account } = req.locals;

	new GroupMergeService(account).deleteGroup(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {
			message: 'Groups removed successfully',
		},
	});
}

async function updateGroupsPicture(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	const fileUploadOptions: SingleFileUploadOptions = {
		field_name: 'file',
		options: {
			fileFilter: ONLY_JPG_IMAGES_ALLOWED,
		},
	};

	let uploadedFile: ResolvedFile | null = null;

	try {
		uploadedFile = await FileUpload.SingleFileUpload(req, res, fileUploadOptions);
	} catch (err: unknown) {
		return next(new APIError(COMMON_ERRORS.FILE_UPLOAD_ERROR, err));
	}

	const ids_to_export = req.body.groups as string[];
	if (!ids_to_export) {
		return next(new APIError(COMMON_ERRORS.INVALID_FIELDS));
	}
	const groups = (await Promise.all(
		ids_to_export
			.map(async (group_id) => {
				try {
					const chat = await whatsapp.getClient().getChatById(group_id);
					if (!chat.isGroup) {
						throw new Error('Group not found');
					}
					return chat as GroupChat;
				} catch (err) {
					return null;
				}
			})
			.filter((groupChat) => groupChat !== null)
	)) as GroupChat[];
	const media = MessageMedia.fromFilePath(uploadedFile.path);
	if (!media) {
		return next(new APIError(COMMON_ERRORS.INTERNAL_SERVER_ERROR));
	}
	groups.forEach((groupChat) => {
		groupChat.setPicture(media);
	});

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

async function updateGroupsDetails(req: Request, res: Response, next: NextFunction) {
	const { account, client_id } = req.locals;

	const whatsapp = WhatsappProvider.getInstance(account, client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(USER_ERRORS.WHATSAPP_NOT_READY));
	}

	const {
		description,
		edit_group_settings,
		send_messages,
		groups: ids_to_update,
	} = req.body as GroupSettingValidationResult;

	const authorId = whatsapp.getClient().info.wid._serialized;

	const groups = (await Promise.all(
		ids_to_update
			.map(async (group_id) => {
				try {
					const chat = await whatsapp.getClient().getChatById(group_id);
					if (!chat.isGroup) {
						throw new Error('Group not found');
					}
					for (let participant of (chat as GroupChat).participants) {
						if (participant.id._serialized === authorId) {
							return participant.isAdmin ? chat : null;
						}
					}
					return null;
				} catch (err) {
					return null;
				}
			})
			.filter((groupChat) => groupChat !== null)
	)) as GroupChat[];

	groups.forEach((groupChat) => {
		if (description !== undefined) {
			groupChat.setDescription(description);
		}
		if (edit_group_settings !== undefined) {
			groupChat.setInfoAdminsOnly(!edit_group_settings);
		}
		if (send_messages !== undefined) {
			groupChat.setMessagesAdminsOnly(!send_messages);
		}
	});

	return Respond({
		res,
		status: 200,
		data: {},
	});
}

const GroupsController = {
	groups,
	exportGroups,
	createGroup,
	mergeGroup,
	deleteMergedGroup,
	mergedGroups,
	refreshGroup,
	updateMergedGroup,
	updateGroupsPicture,
	updateGroupsDetails,
};

export default GroupsController;
