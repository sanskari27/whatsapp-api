import { NextFunction, Request, Response } from 'express';
import { GroupChat } from 'whatsapp-web.js';
import { getOrCache } from '../../config/cache';
import { CACHE_TOKEN_GENERATOR } from '../../config/const';
import APIError, { API_ERRORS } from '../../errors/api-errors';
import { WhatsappProvider } from '../../provider/whatsapp_provider';
import GroupMergeService from '../../services/merged-groups';
import {
	TBusinessContact,
	TContact,
	TGroupBusinessContact,
	TGroupContact,
} from '../../types/whatsapp';
import CSVParser from '../../utils/CSVParser';
import { Respond, RespondCSV, RespondVCF, idValidator } from '../../utils/ExpressUtils';
import VCFParser from '../../utils/VCFParser';
import WhatsappUtils from '../../utils/WhatsappUtils';
import { FileUtils } from '../../utils/files';
import { CreateGroupValidationResult, MergeGroupValidationResult } from './groups.validator';

type GroupDetail = {
	id: string;
	name: string;
};

async function groups(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const groups = await getOrCache<GroupDetail[]>(
			CACHE_TOKEN_GENERATOR.GROUPS(req.locals.user._id),
			async () => {
				const groups = (await whatsapp.getClient().getChats())
					.filter((chat) => chat.isGroup)
					.map((chat) => {
						const groupChat = chat as GroupChat;
						return {
							id: groupChat.id._serialized,
							name: groupChat.name ?? '',
							isMergedGroup: false,
						};
					});

				return groups;
			}
		);
		const merged_groups = await new GroupMergeService(req.locals.user).listGroups();

		return Respond({
			res,
			status: 200,
			data: {
				groups: [...groups, ...merged_groups.map((group) => ({ ...group, groups: undefined }))],
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function exportGroups(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const { group_ids } = req.body as { group_ids: string[] };

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	} else if (!group_ids || group_ids.length === 0) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	const options = {
		business_contacts_only: false,
		vcf: false,
	};
	if (req.body.business_contacts_only) {
		options.business_contacts_only = true;
	}
	if (req.body.vcf) {
		options.vcf = true;
	}

	try {
		const contacts = await getOrCache(
			CACHE_TOKEN_GENERATOR.MAPPED_CONTACTS(req.locals.user._id, options.business_contacts_only),
			async () => await whatsappUtils.getMappedContacts(options.business_contacts_only)
		);
		const groupMergeService = new GroupMergeService(req.locals.user);
		const merged_group_ids = group_ids.filter((id) => idValidator(id)[0]);
		const merged_group_whatsapp_ids = await groupMergeService.extractWhatsappGroupIds(
			merged_group_ids
		);

		const ids_to_export = [...group_ids, ...merged_group_whatsapp_ids].filter(
			(id) => !idValidator(id)[0] // check if all ids is valid whatsapp group ids
		);

		const groups = await Promise.all(
			ids_to_export.map(async (group_id) => {
				if (idValidator(group_id)[0]) {
					// Check if group_id is a merged group_id
					return null;
				}
				const chat = await whatsapp.getClient().getChatById(group_id);

				if (!chat || !chat.isGroup) {
					return null;
				}
				const groupChat = chat as GroupChat;
				return groupChat;
			})
		);

		const filtered_chats = groups.filter((chat) => chat !== null) as GroupChat[];

		const participants = (
			await Promise.all(
				filtered_chats.map(async (groupChat) => {
					const group_participants = await getOrCache(
						CACHE_TOKEN_GENERATOR.GROUPS_EXPORT(
							req.locals.user._id,
							groupChat.id._serialized,
							options.business_contacts_only
						),
						async () => {
							const group_contacts = await whatsappUtils.getGroupContacts(groupChat, {
								business_details: options.business_contacts_only,
								mapped_contacts: contacts,
							});

							return group_contacts.map((contact) => ({
								...contact,
								group_id: groupChat.id._serialized.split('@')[0],
							}));
						}
					);
					return group_participants;
				})
			)
		).flat();

		if (options.vcf) {
			return RespondVCF({
				res,
				filename: 'Exported Group Contacts',
				data: options.business_contacts_only
					? VCFParser.exportBusinessContacts(participants as TBusinessContact[])
					: VCFParser.exportContacts(participants as TContact[]),
			});
		} else {
			return RespondCSV({
				res,
				filename: 'Exported Group Contacts',
				data: options.business_contacts_only
					? CSVParser.exportGroupBusinessContacts(participants as TGroupBusinessContact[])
					: CSVParser.exportGroupContacts(participants as TGroupContact[]),
			});
		}
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function createGroup(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const { csv_file, name } = req.locals.data as CreateGroupValidationResult;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const parsed_csv = await FileUtils.readCSV(csv_file);
		if (!parsed_csv) {
			return next(new APIError(API_ERRORS.COMMON_ERRORS.ERROR_PARSING_CSV));
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
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function mergeGroup(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const { group_ids, group_name } = req.locals.data as MergeGroupValidationResult;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
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

	const group = await new GroupMergeService(req.locals.user).mergeGroup(group_name, chat_ids);

	return Respond({
		res,
		status: 200,
		data: {
			group: group,
		},
	});
}

async function updateMergedGroup(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const { group_ids, group_name } = req.locals.data as MergeGroupValidationResult;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	const whatsappUtils = new WhatsappUtils(whatsapp);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
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

	const group = await new GroupMergeService(req.locals.user).updateGroup(req.locals.id, {
		group_ids: chat_ids,
		name: group_name,
	});

	return Respond({
		res,
		status: 200,
		data: {
			group,
		},
	});
}

async function mergedGroups(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;

	const whatsapp = WhatsappProvider.getInstance(client_id);
	if (!whatsapp.isReady()) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}

	try {
		const merged_groups = await new GroupMergeService(req.locals.user).listGroups();

		return Respond({
			res,
			status: 200,
			data: {
				groups: merged_groups,
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function deleteMergedGroup(req: Request, res: Response, next: NextFunction) {
	new GroupMergeService(req.locals.user).deleteGroup(req.locals.id);

	return Respond({
		res,
		status: 200,
		data: {
			message: 'Groups removed successfully',
		},
	});
}

const GroupsController = {
	groups,
	exportGroups,
	createGroup,
	mergeGroup,
	deleteMergedGroup,
	mergedGroups,
	updateMergedGroup,
};

export default GroupsController;
