import WAWebJS from 'whatsapp-web.js';
import { groupReplyDB, mergedGroupsDB } from '../../config/postgres';
import { Delay, idValidator } from '../../utils/ExpressUtils';
import { AccountService } from '../account';

export default class GroupMergeService {
	private _user: AccountService;

	public constructor(user: AccountService) {
		this._user = user;
	}

	async listGroups() {
		const merged_groups = await mergedGroupsDB.findMany({
			where: {
				username: this._user.username,
			},
		});

		return merged_groups.map((group) => ({
			id: group.id,
			name: group.name ?? 'Unnamed Group',
			isMergedGroup: true,
			groups: group.groups,
			group_reply: {
				saved: group.chat_reply_saved,
				unsaved: group.chat_reply_unsaved,
			},
			private_reply: {
				saved: group.private_reply_saved,
				unsaved: group.private_reply_unsaved,
			},
		}));
	}

	async mergeGroup(
		name: string,
		group_ids: string[],
		{
			group_reply,
			private_reply,
		}: {
			group_reply?: {
				saved: string;
				unsaved: string;
			} | null;
			private_reply?: {
				saved: string;
				unsaved: string;
			} | null;
		}
	) {
		const group = await mergedGroupsDB.create({
			data: {
				username: this._user.username,
				name,
				groups: group_ids,
				chat_reply_saved: group_reply?.saved ?? '',
				chat_reply_unsaved: group_reply?.unsaved ?? '',
				private_reply_saved: private_reply?.saved ?? '',
				private_reply_unsaved: private_reply?.unsaved ?? '',
			},
		});

		return {
			id: group.id,
			name: group.name,
			isMergedGroup: true,
			groups: group.groups,
			group_reply: {
				saved: group.chat_reply_saved,
				unsaved: group.chat_reply_unsaved,
			},
			private_reply: {
				saved: group.private_reply_saved,
				unsaved: group.private_reply_unsaved,
			},
		};
	}

	async updateGroup(
		id: string,
		{ name, group_ids }: { name?: string; group_ids?: string[] },
		{
			group_reply,
			private_reply,
		}: {
			group_reply?: {
				saved: string;
				unsaved: string;
			} | null;
			private_reply?: {
				saved: string;
				unsaved: string;
			} | null;
		}
	) {
		const exists = await mergedGroupsDB.findUnique({ where: { id } });

		if (!exists) {
			return false;
		}

		const merged_group = await mergedGroupsDB.update({
			where: { id },
			data: {
				name,
				groups: group_ids,
				chat_reply_saved: group_reply?.saved ?? '',
				chat_reply_unsaved: group_reply?.unsaved ?? '',
				private_reply_saved: private_reply?.saved ?? '',
				private_reply_unsaved: private_reply?.unsaved ?? '',
			},
		});

		return {
			id: merged_group.id,
			name: merged_group.name,
			isMergedGroup: true,
			groups: merged_group.groups,
			group_reply: {
				saved: merged_group.chat_reply_saved,
				unsaved: merged_group.chat_reply_unsaved,
			},
			private_reply: {
				saved: merged_group.private_reply_saved,
				unsaved: merged_group.private_reply_unsaved,
			},
		};
	}
	async deleteGroup(id: string) {
		await mergedGroupsDB.delete({ where: { id } });
	}
	async removeFromGroup(id: string, group_ids: string[]) {
		const exists = await mergedGroupsDB.findUnique({ where: { id } });

		if (!exists) {
			return;
		}

		mergedGroupsDB.update({
			where: { id },
			data: {
				groups: exists.groups.filter((id) => !group_ids.includes(id)),
			},
		});
	}

	async extractWhatsappGroupIds(ids: string | string[]) {
		const searchable_ids = typeof ids === 'string' ? [ids] : ids;

		const { whatsapp_ids, merged_group_ids } = searchable_ids.reduce(
			(acc, id) => {
				if (idValidator(id)[0]) {
					acc.merged_group_ids.push(id);
				} else {
					acc.whatsapp_ids.push(id);
				}
				return acc;
			},
			{
				whatsapp_ids: [] as string[],
				merged_group_ids: [] as string[],
			}
		);

		const merged_groups = await mergedGroupsDB.findMany({
			where: {
				username: this._user.username,
				id: {
					in: merged_group_ids,
				},
			},
		});

		const whatsapp_extracted_ids = merged_groups.map((group) => group.groups).flat();
		return [...whatsapp_ids, ...whatsapp_extracted_ids];
	}

	public async sendGroupReply(
		whatsapp: WAWebJS.Client,
		{
			chat,
			message,
			contact,
		}: {
			chat: WAWebJS.GroupChat;
			message: WAWebJS.Message;
			contact: WAWebJS.Contact;
		}
	) {
		const group_id = chat.id._serialized;

		const mergedGroup = await mergedGroupsDB.findFirst({
			where: {
				username: this._user.username,
				groups: {
					has: group_id,
				},
			},
		});

		if (!mergedGroup) {
			return;
		}

		const admin = chat.participants.find((chatObj) => chatObj.id._serialized === message.from);
		if (admin && (admin.isAdmin || admin.isSuperAdmin)) {
			return;
		}

		const sendReply = async (reply_text: string, private_reply: boolean = false) => {
			if (!reply_text) {
				return;
			}
			await Delay(Math.random() * 5 + 2);
			groupReplyDB
				.create({
					data: {
						username: this._user.username,
						replied_to: contact.id._serialized,
						reply_type: private_reply ? 'PRIVATE' : 'CHAT',
					},
				})
				.then(() => {
					if (private_reply) {
						whatsapp.sendMessage(contact.id._serialized, reply_text, {
							quotedMessageId: message.id._serialized,
						});
					} else {
						message.reply(reply_text);
					}
				})
				.catch(() => {});
		};

		sendReply(contact.isMyContact ? mergedGroup.chat_reply_saved : mergedGroup.chat_reply_unsaved);

		sendReply(
			contact.isMyContact ? mergedGroup.private_reply_saved : mergedGroup.chat_reply_unsaved,
			true
		);
	}
}
