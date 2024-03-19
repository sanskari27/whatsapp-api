import fs from 'fs';
import { Types } from 'mongoose';
import WAWebJS, { MessageMedia, Poll } from 'whatsapp-web.js';
import { ATTACHMENTS_PATH } from '../../config/const';
import { GroupPrivateReplyDB, GroupReplyDB } from '../../repository/group-reply';
import MergedGroupDB from '../../repository/merged-groups';
import IMergedGroup from '../../types/merged-group';
import IPolls from '../../types/polls';
import { IUser } from '../../types/user';
import { Delay, getRandomNumber, idValidator, randomMessageText } from '../../utils/ExpressUtils';
import { FileUtils } from '../../utils/files';
import ContactCardService from '../contact-card';
import TokenService from '../token';
import UploadService from '../uploads';
import UserService from '../user';

const processGroup = (group: IMergedGroup) => {
	return {
		id: group._id as string,
		name: (group.name as string) ?? '',
		isMergedGroup: true,
		groups: group.groups,
		group_reply_saved: group.group_reply_saved,
		group_reply_unsaved: group.group_reply_unsaved,
		private_reply_saved: group.private_reply_saved,
		private_reply_unsaved: group.private_reply_unsaved,
	};
};

export default class GroupMergeService {
	private user: IUser;

	public constructor(user: IUser) {
		this.user = user;
	}

	async listGroups() {
		const merged_groups = await MergedGroupDB.find({
			user: this.user,
		});

		return merged_groups.map(processGroup);
	}

	async mergeGroup(
		name: string,
		group_ids: string[],
		details: {
			group_reply_saved: {
				text: string;
				shared_contact_cards: Types.ObjectId[];
				attachments: Types.ObjectId[];
				polls: IPolls[];
			};
			group_reply_unsaved: {
				text: string;
				shared_contact_cards: Types.ObjectId[];
				attachments: Types.ObjectId[];
				polls: IPolls[];
			};
			private_reply_saved: {
				text: string;
				shared_contact_cards: Types.ObjectId[];
				attachments: Types.ObjectId[];
				polls: IPolls[];
			};
			private_reply_unsaved: {
				text: string;
				shared_contact_cards: Types.ObjectId[];
				attachments: Types.ObjectId[];
				polls: IPolls[];
			};
			restricted_numbers?: Types.ObjectId;
			reply_business_only: boolean;
			random_string: boolean;
			min_delay: number;
			max_delay: number;
		}
	) {
		const group = await MergedGroupDB.create({
			user: this.user,
			name,
			groups: group_ids,
			...details,
		});

		return processGroup(group);
	}

	async updateGroup(
		id: Types.ObjectId,
		{ name, group_ids }: { name?: string; group_ids?: string[] },
		details: {
			group_reply_saved: {
				text: string;
				shared_contact_cards: Types.ObjectId[];
				attachments: Types.ObjectId[];
				polls: IPolls[];
			};
			group_reply_unsaved: {
				text: string;
				shared_contact_cards: Types.ObjectId[];
				attachments: Types.ObjectId[];
				polls: IPolls[];
			};
			private_reply_saved: {
				text: string;
				shared_contact_cards: Types.ObjectId[];
				attachments: Types.ObjectId[];
				polls: IPolls[];
			};
			private_reply_unsaved: {
				text: string;
				shared_contact_cards: Types.ObjectId[];
				attachments: Types.ObjectId[];
				polls: IPolls[];
			};
			restricted_numbers?: Types.ObjectId;
			reply_business_only?: boolean;
			random_string?: boolean;
			min_delay: number;
			max_delay: number;
		}
	) {
		const merged_group = await MergedGroupDB.findById(id);

		if (!merged_group) {
			return null;
		}
		await MergedGroupDB.updateOne(
			{ _id: id },
			{
				$set: {
					...(name && { name }),
					...(group_ids && { groups: group_ids }),
					...(details.group_reply_saved && { group_reply: details.group_reply_saved }),
					...(details.group_reply_unsaved && { group_reply: details.group_reply_unsaved }),
					...(details.private_reply_saved && { group_reply: details.private_reply_saved }),
					...(details.private_reply_unsaved && { group_reply: details.private_reply_unsaved }),
					...(details.restricted_numbers && { restricted_numbers: details.restricted_numbers }),
					...(details.reply_business_only && { reply_business_only: details.reply_business_only }),
					...(details.random_string && { random_string: details.random_string }),
					...(details.min_delay && { min_delay: details.min_delay }),
					...(details.max_delay && { max_delay: details.max_delay }),
				},
			}
		);

		await merged_group.save();
		return processGroup(merged_group);
	}

	async toggleActive(id: Types.ObjectId) {
		const merged_group = await MergedGroupDB.findById(id);

		if (!merged_group) {
			return false;
		}
		await MergedGroupDB.updateOne({ _id: id }, { $set: { active: !merged_group.active } });
		return !merged_group.active;
	}

	async clear(id: Types.ObjectId) {
		await GroupPrivateReplyDB.deleteMany({ mergedGroup: id });
		await GroupReplyDB.deleteMany({ mergedGroup: id });
	}

	async generateReport(id: Types.ObjectId) {
		const private_replies = await GroupPrivateReplyDB.find({ mergedGroup: id });
		const group_replies = await GroupReplyDB.find({ mergedGroup: id });

		return [
			...private_replies.map((doc) => ({
				recipient: doc.from.split('@')[0],
				group_name: doc.group_name,
				reply_type: 'Private Reply',
			})),
			...group_replies.map((doc) => ({
				recipient: doc.from.split('@')[0],
				group_name: doc.group_name,
				reply_type: 'In Chat Reply',
			})),
		];
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

		const merged_groups = await MergedGroupDB.find({
			user: this.user,
			_id: { $in: merged_group_ids },
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

		const doc = await MergedGroupDB.findOne({
			user: this.user,
			groups: group_id,
		}).populate('restricted_numbers');

		if (
			!doc ||
			!doc.group_reply_saved ||
			!doc.group_reply_unsaved ||
			!doc.private_reply_saved ||
			!doc.private_reply_unsaved
		) {
			return;
		}

		const admin = chat.participants.find((chatObj) => chatObj.id._serialized === message.from);
		if (admin && (admin.isAdmin || admin.isSuperAdmin)) {
			return;
		}
		if (doc.reply_business_only && !contact.isBusiness) {
			return;
		}
		if (doc.restricted_numbers) {
			const parsed_csv = await FileUtils.readCSV(doc.restricted_numbers.filename);
			if (parsed_csv && parsed_csv.findIndex((el) => el.number === contact.id.user)) {
				return;
			}
		}

		const { message_1: PROMOTIONAL_MESSAGE_1, message_2: PROMOTIONAL_MESSAGE_2 } =
			await TokenService.getPromotionalMessage();
		const { isSubscribed, isNew } = new UserService(this.user).isSubscribed();

		const groupReply = contact.isMyContact ? doc.group_reply_saved : doc.group_reply_unsaved;
		const privateReply = contact.isMyContact ? doc.private_reply_saved : doc.private_reply_unsaved;

		await Delay(getRandomNumber(doc.min_delay, doc.max_delay));
		try {
			await GroupReplyDB.create({
				user: this.user,
				from: contact.id._serialized,
				mergedGroup: doc,
				group_name: chat.name,
			});
			let _reply_text = groupReply.text.replace('{{public_name}}', contact.pushname);

			if (_reply_text.length > 0 && doc.random_string) {
				_reply_text += randomMessageText();
			}

			message.reply(_reply_text);

			groupReply.shared_contact_cards?.forEach(async (id) => {
				const contact_service = new ContactCardService(this.user);
				const contact = await contact_service.getContact(id as unknown as Types.ObjectId);
				if (!contact) return;
				message.reply(contact.vCardString);
			});

			groupReply.attachments?.forEach(async (id) => {
				const attachment_service = new UploadService(this.user);
				const attachment = await attachment_service.getAttachment(id as unknown as Types.ObjectId);
				if (!attachment) return;
				const { filename, caption, name } = attachment;
				const path = __basedir + ATTACHMENTS_PATH + filename;
				if (!fs.existsSync(path)) {
					return null;
				}
				const media = MessageMedia.fromFilePath(path);
				if (name) {
					media.filename = name + path.substring(path.lastIndexOf('.'));
				}
				message.reply(media, undefined, { caption: caption });
			});

			groupReply.polls?.forEach(async (poll) => {
				const { title, options, isMultiSelect } = poll;
				message.reply(new Poll(title, options, { allowMultipleAnswers: isMultiSelect }));
			});

			if (groupReply.shared_contact_cards && groupReply.shared_contact_cards.length > 0) {
				message.reply(PROMOTIONAL_MESSAGE_2);
			} else if (!isSubscribed && isNew) {
				message.reply(PROMOTIONAL_MESSAGE_1);
			}
		} catch (err) {}

		try {
			await GroupPrivateReplyDB.create({
				user: this.user,
				from: contact.id._serialized,
				mergedGroup: doc,
				group_name: chat.name,
			});
			let _reply_text = groupReply.text.replace('{{public_name}}', contact.pushname);

			if (_reply_text.length > 0 && doc.random_string) {
				_reply_text += randomMessageText();
			}

			const to = contact.id._serialized;
			whatsapp.sendMessage(to, _reply_text);

			privateReply.shared_contact_cards?.forEach(async (id) => {
				const contact_service = new ContactCardService(this.user);
				const contact = await contact_service.getContact(id as unknown as Types.ObjectId);
				if (!contact) return;
				whatsapp.sendMessage(to, contact.vCardString);
			});

			privateReply.attachments?.forEach(async (id) => {
				const attachment_service = new UploadService(this.user);
				const attachment = await attachment_service.getAttachment(id as unknown as Types.ObjectId);
				if (!attachment) return;
				const { filename, caption, name } = attachment;
				const path = __basedir + ATTACHMENTS_PATH + filename;
				if (!fs.existsSync(path)) {
					return null;
				}
				const media = MessageMedia.fromFilePath(path);
				if (name) {
					media.filename = name + path.substring(path.lastIndexOf('.'));
				}
				whatsapp.sendMessage(to, media, { caption: caption });
			});

			groupReply.polls?.forEach(async (poll) => {
				const { title, options, isMultiSelect } = poll;
				whatsapp.sendMessage(to, new Poll(title, options, { allowMultipleAnswers: isMultiSelect }));
			});

			if (groupReply.shared_contact_cards && groupReply.shared_contact_cards.length > 0) {
				whatsapp.sendMessage(to, PROMOTIONAL_MESSAGE_2);
			} else if (!isSubscribed && isNew) {
				whatsapp.sendMessage(to, PROMOTIONAL_MESSAGE_1);
			}
		} catch (err) {}
	}
}
