import { Types } from 'mongoose';
import Logger from 'n23-logger';
import WAWebJS from 'whatsapp-web.js';
import GroupPrivateReplyDB from '../../repository/group-private-reply';
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
		}));
	}

	async mergeGroup(name: string, group_ids: string[], group_reply: string = '') {
		const group = await MergedGroupDB.create({
			user: this.user,
			name,
			groups: group_ids,
			group_reply,
		});

		return {
			id: group._id as string,
			name: group.name as string,
			isMergedGroup: true,
			groups: group.groups,
			group_reply: group.group_reply,
		};
	}

	async updateGroup(
		id: Types.ObjectId,
		{ name, group_ids, group_reply }: { name?: string; group_ids?: string[]; group_reply?: string }
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
		if (group_reply) {
			merged_group.group_reply = group_reply;
		}

		await merged_group.save();
		return {
			id: merged_group._id as string,
			name: merged_group.name as string,
			isMergedGroup: true,
			groups: merged_group.groups,
			group_reply: merged_group.group_reply,
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
		chat: WAWebJS.GroupChat,
		message: WAWebJS.Message
	) {
		try {
			const group_id = chat.id._serialized;

			const merged_group = await MergedGroupDB.findOne({ groups: group_id });
			if (!merged_group) {
				return;
			}

			await GroupPrivateReplyDB.create({
				user: this.user,
				from: message.from,
			});

			whatsapp
				.sendMessage(message.from, merged_group.group_reply, {
					quotedMessageId: message.id._serialized,
				})
				.catch((err) => {
					Logger.error('Error sending message:', err);
				});
		} catch (err) {
			//ignore since message already exists
		}
	}
}
