import { TASK_RESULT_TYPE, TASK_TYPE } from '../../config/const';
import { taskDB } from '../../config/postgres';
import InternalError, { INTERNAL_ERRORS } from '../../errors/internal-errors';
import { AccountService } from '../account';

export default class TaskService {
	private _user: AccountService;

	public constructor(user: AccountService) {
		this._user = user;
	}

	async listTasks() {
		const tasks = await taskDB.findMany({ where: { username: this._user.username } });
		return tasks.map((task) => ({
			id: task.id,
			type: task.type,
			description: task.description,
			status: task.status,
			data: task.data,
			data_result_type: task.data_result_type,
		}));
	}

	async createTask(
		type: TASK_TYPE,
		response_type: TASK_RESULT_TYPE,
		{ description }: { description?: string } = {}
	) {
		const task = await taskDB.create({
			data: {
				username: this._user.username,
				type,
				data_result_type: response_type,
				description,
			},
		});
		return task.id;
	}

	async markCompleted(id: string, data?: string) {
		await taskDB.update({
			where: { id },
			data: {
				data,
				status: 'COMPLETED',
			},
		});
	}

	async markFailed(id: string) {
		await taskDB.update({
			where: { id },
			data: {
				status: 'FAILED',
			},
		});
	}

	async getFile(id: string) {
		const task = await taskDB.findUnique({ where: { id } });
		if (!task || !['VCF', 'CSV'].includes(task.data_result_type)) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		return { data: task.data, result_type: task.data_result_type, id: task.id };
	}

	async deleteTask(id: string) {
		const task = await taskDB.findUnique({ where: { id } });
		if (!task) {
			throw new InternalError(INTERNAL_ERRORS.COMMON_ERRORS.NOT_FOUND);
		}
		await taskDB.delete({ where: { id } });
		return (
			id +
			(task.data_result_type === TASK_RESULT_TYPE.VCF
				? '.vcf'
				: task.data_result_type === TASK_RESULT_TYPE.CSV
				? '.csv'
				: '')
		);
	}
}
