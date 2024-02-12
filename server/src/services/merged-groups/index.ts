import { Model, Types } from 'mongoose';
import Logger from 'n23-logger';
import WAWebJS from 'whatsapp-web.js';
import { GroupPrivateReplyDB, GroupReplyDB } from '../../repository/group-reply';
import MergedGroupDB from '../../repository/merged-groups';
import { IUser } from '../../types/user';

export default class GroupMergeService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	async listGroups() {
		const merged_groups = await MergedGroupDB.find({
			user: this.user,
		});

		return merged_groups.map((group) => ({
			id: group._id as string,
			name: (group.name as string) ?? '',
			isMergedGroup: true,
			groups: group.groups,
			group_reply: group.group_reply,
			private_reply: group.private_reply,
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
		const group = await MergedGroupDB.create({
			user: this.user,
			name,
			groups: group_ids,
			group_reply,
			private_reply,
		});

		return {
			id: group._id as string,
			name: group.name as string,
			isMergedGroup: true,
			groups: group.groups,
			group_reply: group.group_reply,
			private_reply: group.private_reply,
		};
	}

	async updateGroup(
		id: Types.ObjectId,
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
		const merged_group = await MergedGroupDB.findById(id);

		if (!merged_group) {
			return false;
		}
		if (name) {
			merged_group.name = name;
		}
		if (group_ids) {
			merged_group.groups = group_ids;
		}
		if (group_reply !== undefined) {
			merged_group.group_reply = group_reply;
		}
		if (private_reply !== undefined) {
			merged_group.private_reply = private_reply;
		}

		await merged_group.save();
		return {
			id: merged_group._id as string,
			name: merged_group.name as string,
			isMergedGroup: true,
			groups: merged_group.groups,
			group_reply: merged_group.group_reply,
			private_reply: merged_group.private_reply,
		};
	}
	async deleteGroup(group_id: Types.ObjectId) {
		await MergedGroupDB.deleteOne({ _id: group_id });
	}
	async removeFromGroup(id: Types.ObjectId, group_ids: string[]) {
		const mergedGroup = await MergedGroupDB.findById(id);
		if (!mergedGroup) return;
		mergedGroup.groups = mergedGroup.groups.filter((id) => !group_ids.includes(id));
		await mergedGroup.save();
	}

	async extractWhatsappGroupIds(ids: string | string[]) {
		const searchable_ids = typeof ids === 'string' ? [ids] : ids;
		const merged_groups = await MergedGroupDB.find({
			user: this.user,
			_id: { $in: searchable_ids },
		});

		return merged_groups.map((group) => group.groups).flat();
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

		const group_reply_docs = await MergedGroupDB.findOne({
			groups: group_id,
			group_reply: { $exists: true, $ne: null },
		});
		const private_reply_docs = await MergedGroupDB.findOne({
			groups: group_id,
			private_reply: { $exists: true, $ne: null },
		});

		if (!group_reply_docs && !private_reply_docs) {
			return;
		}
		const create_docs_data = { user: this.user, from: contact.id._serialized };

		const sendReply = (
			model: Model<any, {}, {}, {}, any>,
			to: string,
			reply_text: string,
			message: WAWebJS.Message,
			private_reply: boolean = false
		) => {
			if (!reply_text) {
				return;
			}
			model
				.create(create_docs_data)
				.then(() => {
					if (private_reply) {
						whatsapp
							.sendMessage(to, reply_text, {
								quotedMessageId: message.id._serialized,
							})
							.catch((err) => Logger.error('Error sending message:', err));
					} else {
						message.reply(reply_text).catch((err) => Logger.error('Error sending message:', err));
					}
				})
				.catch(() => {});
		};

		if (group_reply_docs && group_reply_docs.group_reply !== null) {
			sendReply(
				GroupReplyDB,
				contact.id._serialized,
				contact.isMyContact
					? group_reply_docs.group_reply.saved
					: group_reply_docs.group_reply.unsaved,
				message
			);
		}

		if (private_reply_docs && private_reply_docs.private_reply !== null) {
			sendReply(
				GroupPrivateReplyDB,
				contact.id._serialized,
				contact.isMyContact
					? private_reply_docs.private_reply.saved
					: private_reply_docs.private_reply.unsaved,
				message,
				true
			);
		}
	}
}
