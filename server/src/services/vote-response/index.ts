import Logger from 'n23-logger';
import WAWebJS from 'whatsapp-web.js';
import { voteResponseDB } from '../../config/postgres';
import DateUtils from '../../utils/DateUtils';
import { AccountService } from '../account';

export default class VoteResponseService {
	private _user: AccountService;

	public constructor(user: AccountService) {
		this._user = user;
	}

	getPollDetails(data: WAWebJS.Message) {
		return {
			title: data.pollName,
			options: (data.pollOptions as unknown as { name: string }[]).map((opt) => opt.name),
			isMultiSelect: data.allowMultipleAnswers,
			chat_id: data.to,
		};
	}

	async saveVote(details: {
		title: string;
		options: string[];
		isMultiSelect: boolean;

		chat_id: string;
		voter_number: string;

		voter_name: string;
		group_name: string;
		selected_option: string[];
		voted_at: Date;
	}) {
		try {
			const voteResponse = await voteResponseDB.findUnique({
				where: {
					username_title_options_isMultiSelect_chat_id_voter_number: {
						username: this._user.username,
						title: details.title,
						options: details.options,
						isMultiSelect: details.isMultiSelect,
						chat_id: details.chat_id,
						voter_number: details.voter_number,
					},
				},
			});

			if (!voteResponse) {
				return await voteResponseDB.create({
					data: {
						username: this._user.username,
						...details,
					},
				});
			}

			await voteResponseDB.update({
				where: { id: voteResponse.id },
				data: {
					selected_option: details.selected_option,
					voted_at: details.voted_at,
				},
			});
			return voteResponse;
		} catch (err: any) {
			Logger.error('Error saving poll', err);
			return null;
		}
	}

	async allPolls() {
		const polls = await voteResponseDB.groupBy({
			where: {
				username: this._user.username,
			},
			by: ['title', 'options', 'isMultiSelect'],
			_count: {
				_all: true,
			},
		});

		return polls.map((poll) => ({
			title: poll.title,
			options: poll.options,
			isMultiSelect: poll.isMultiSelect,
			vote_count: poll._count,
		}));
	}

	async getPoll({
		title,
		options,
		isMultiSelect,
	}: {
		title: string;
		options: string[];
		isMultiSelect: boolean;
	}) {
		const polls = await voteResponseDB.findMany({
			where: {
				username: this._user.username,
				title,
				options: { equals: options },
				isMultiSelect,
			},
		});

		return polls.map((poll) => ({
			title: poll.title,
			options: poll.options,
			isMultiSelect: poll.isMultiSelect,
			voter_number: poll.voter_number,
			voter_name: poll.voter_name,
			group_name: poll.group_name,
			selected_option: poll.selected_option,
			voted_at: DateUtils.getMoment(poll.voted_at).format('DD-MM-YYYY HH:mm:ss'),
		}));
	}

	async getPolls() {
		const polls = await voteResponseDB.findMany({
			where: { username: this._user.username },
		});

		return polls.map((poll) => ({
			title: poll.title,
			options: poll.options,
			isMultiSelect: poll.isMultiSelect,
			voter_number: poll.voter_number,
			voter_name: poll.voter_name,
			group_name: poll.group_name,
			selected_option: poll.selected_option,
			voted_at: DateUtils.getMoment(poll.voted_at).format('DD-MM-YYYY HH:mm:ss'),
		}));
	}
}
