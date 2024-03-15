import { uploadsDB } from '../../config/postgres';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { AccountService } from '../account';

export default class UploadService {
	private _user: AccountService;

	public constructor(user: AccountService) {
		this._user = user;
	}

	async listCSVs() {
		const csv_docs = await uploadsDB.findMany({
			where: {
				username: this._user.username,
				type: 'NUMBERS',
			},
		});
		return csv_docs.map((csv) => ({
			id: csv.id,
			name: csv.name,
			filename: csv.filename,
			headers: csv.headers,
		}));
	}

	async getCSVFile(id: string) {
		const csv_docs = await uploadsDB.findUnique({ where: { id } });
		return csv_docs?.filename || null;
	}

	async addCSV(name: string, filename: string, headers: string[]) {
		const exists = await uploadsDB.count({
			where: {
				name,
				username: this._user.username,
				type: 'NUMBERS',
			},
		});
		if (exists > 0) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.ALREADY_EXISTS);
		}
		const csv_doc = await uploadsDB.create({
			data: {
				username: this._user.username,
				name,
				filename,
				type: 'NUMBERS',
				headers,
			},
		});
		return {
			id: csv_doc.id,
			name: csv_doc.name,
			filename: csv_doc.filename,
			headers: csv_doc.headers,
		};
	}

	async delete(id: string) {
		const doc = await uploadsDB.delete({ where: { id } });
		return doc.filename;
	}

	async listAttachments(ids?: string[]) {
		const attachments = await uploadsDB.findMany({
			where: {
				username: this._user.username,
				type: 'ATTACHMENT',
				...(ids && {
					id: {
						in: ids,
					},
				}),
			},
		});
		return attachments.map((attachment) => ({
			id: attachment.id,
			caption: attachment.caption,
			filename: attachment.filename,
			name: attachment.name ?? '',
			custom_caption: attachment.custom_caption ?? false,
		}));
	}

	async getAttachment(id: string) {
		const attachment = await uploadsDB.findUnique({ where: { id } });
		if (!attachment) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		return {
			id: attachment.id,
			name: attachment.name,
			filename: attachment.filename,
			caption: attachment.caption,
			custom_caption: attachment.custom_caption ?? false,
		};
	}

	async addAttachment(
		name: string,
		caption: string,
		filename: string,
		custom_caption: boolean = false
	) {
		const attachment = await uploadsDB.create({
			data: {
				username: this._user.username,
				name,
				filename,
				type: 'ATTACHMENT',
				caption,
				custom_caption,
			},
		});

		return {
			id: attachment.id,
			name: attachment.name,
			filename: attachment.filename,
			caption: attachment.caption,
			custom_caption: attachment.custom_caption ?? false,
		};
	}

	async updateAttachmentFile(id: string, filename: string) {
		const attachment = await uploadsDB.findUnique({ where: { id } });
		if (!attachment) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		const prev_name = attachment.filename;
		await uploadsDB.update({
			where: { id: attachment.id },
			data: {
				filename,
			},
		});
		return { previous: prev_name, current: filename };
	}

	async updateAttachment(
		id: string,
		data: { name?: string; caption?: string; custom_caption?: boolean }
	) {
		const exists = await uploadsDB.count({ where: { id } });
		if (exists === 0) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}

		const attachment = await uploadsDB.update({
			where: { id },
			data: data,
		});

		return {
			id: attachment.id,
			name: attachment.name,
			filename: attachment.filename,
			caption: attachment.caption,
			custom_caption: attachment.custom_caption ?? false,
		};
	}
}
