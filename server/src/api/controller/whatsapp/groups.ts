import { NextFunction, Request, Response } from 'express';
import { GroupChat } from 'whatsapp-web.js';
import { z } from 'zod';
import { getOrCache } from '../../../config/cache';
import { CACHE_TOKEN_GENERATOR } from '../../../config/const';
import GroupMergeService from '../../../database/services/merged-groups';
import APIError, { API_ERRORS } from '../../../errors/api-errors';
import { WhatsappProvider } from '../../../provider/whatsapp_provider';
import {
	TBusinessContact,
	TContact,
	TGroupBusinessContact,
	TGroupContact,
} from '../../../types/whatsapp';
import CSVParser from '../../../utils/CSVParser';
import { Respond, RespondCSV, RespondVCF, idValidator } from '../../../utils/ExpressUtils';
import VCFParser from '../../../utils/VCFParser';
import WhatsappUtils from '../../../utils/WhatsappUtils';
import { FileUtils } from '../../../utils/files';

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
			CACHE_TOKEN_GENERATOR.GROUPS(client_id),
			async () => {
				const groups = (await whatsapp.getClient().getChats())
					.filter((chat) => chat.isGroup)
					.map((chat) => {
						const groupChat = chat as GroupChat;
						return {
							id: groupChat.id._serialized,
							name: groupChat.name,
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
				groups: [...groups, ...merged_groups],
			},
		});
	} catch (err) {
		return next(new APIError(API_ERRORS.USER_ERRORS.SESSION_INVALIDATED));
	}
}

async function exportGroups(req: Request, res: Response, next: NextFunction) {
	const client_id = req.locals.client_id;
	const { group_ids } = req.query;

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
	if (req.query.business_contacts_only && req.query.business_contacts_only === 'true') {
		options.business_contacts_only = true;
	}
	if (req.query.vcf && req.query.vcf === 'true') {
		options.vcf = true;
	}

	try {
		const contacts = await getOrCache(
			CACHE_TOKEN_GENERATOR.MAPPED_CONTACTS(client_id, options.business_contacts_only),
			async () => await whatsappUtils.getMappedContacts(options.business_contacts_only)
		);
		const groupMergeService = new GroupMergeService(req.locals.user);
		const group_ids_array = (group_ids as string).split(',');
		const merged_group_ids = group_ids_array.filter((id) => idValidator(id)[0]);
		const merged_group_whatsapp_ids = await groupMergeService.extractWhatsappGroupIds(
			merged_group_ids
		);

		const ids_to_export = [...group_ids_array, ...merged_group_whatsapp_ids].filter(
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
							client_id,
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

	const reqValidator = z.object({
		csv_file: z.string().default(''),
	});
	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	const { csv_file } = reqValidatorResult.data;

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

		const groups_map: {
			[group_name: string]: string[];
		} = {};

		whatsapp.getClient().createGroup('');

		await Promise.all(
			parsed_csv.map(async (row) => {
				const numberWithId = await whatsappUtils.getNumberWithId(row.number);
				if (!numberWithId) {
					return; // Skips to the next iteration
				}
				const group_name = row.group;

				if (!groups_map[group_name]) {
					groups_map[group_name] = [];
				}
				groups_map[group_name].push(numberWithId.numberId);
			})
		);

		Object.keys(groups_map).forEach((group_name) => {
			whatsappUtils.createGroup(group_name, groups_map[group_name]);
		});

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

	const reqValidator = z
		.object({
			group_name: z.string(),
			group_ids: z.string().array().default([]),
		})
		.refine((obj) => obj.group_ids.length !== 0);
	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	const { group_ids, group_name } = reqValidatorResult.data;

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

	new GroupMergeService(req.locals.user).mergeGroup(group_name, chat_ids);

	return Respond({
		res,
		status: 200,
		data: {
			message: 'Groups merged successfully',
		},
	});
}

async function deleteMergedGroup(req: Request, res: Response, next: NextFunction) {
	const [isGroupIDValid, group_id] = idValidator(req.params.group_id);

	if (!isGroupIDValid) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}

	new GroupMergeService(req.locals.user).deleteGroup(group_id);

	return Respond({
		res,
		status: 200,
		data: {
			message: 'Groups removed successfully',
		},
	});
}

async function removeGroupFromMerge(req: Request, res: Response, next: NextFunction) {
	const [isGroupIDValid, group_id] = idValidator(req.params.group_id);
	const reqValidator = z
		.object({
			group_ids: z.string().array().default([]),
		})
		.refine((obj) => obj.group_ids.length !== 0);

	const reqValidatorResult = reqValidator.safeParse(req.body);

	if (!isGroupIDValid || !reqValidatorResult.success) {
		return next(new APIError(API_ERRORS.COMMON_ERRORS.INVALID_FIELDS));
	}
	const { group_ids } = reqValidatorResult.data;

	new GroupMergeService(req.locals.user).removeFromGroup(group_id, group_ids);

	return Respond({
		res,
		status: 200,
		data: {
			message: 'GroupIDs removed successfully',
		},
	});
}

const GroupsController = {
	groups,
	exportGroups,
	createGroup,
	mergeGroup,
	deleteMergedGroup,
	removeGroupFromMerge,
};

export default GroupsController;
