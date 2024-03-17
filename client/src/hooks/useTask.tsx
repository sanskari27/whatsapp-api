import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { socket } from '../config/APIInstance';
import { SOCKET_EVENT } from '../config/const';
import TaskService from '../services/task.service';
import { StoreNames, StoreState } from '../store';

export enum TASK_STATUS {
	COMPLETED = 'COMPLETED',
	PENDING = 'PENDING',
	FAILED = 'FAILED',
}

export enum TASK_RESULT_TYPE {
	CSV = 'CSV',
	VCF = 'VCF',
	NONE = 'NONE',
}

export default function useTask() {
	const toast = useToast();
	const [tasks, setTasks] = useState<
		{
			id: string;
			type: string;
			description: string;
			status: TASK_STATUS;
			data_result_type: TASK_RESULT_TYPE;
			data?: string;
		}[]
	>([]);

	const { username } = useSelector((state: StoreState) => state[StoreNames.USER]);

	useEffect(() => {
		TaskService.listTasks().then(setTasks);
	}, []);
	useEffect(() => {
		if (!username) return;
		socket.emit(SOCKET_EVENT.ATTACH_SOCKET, username);
	}, [username]);

	useEffect(() => {
		const listenerCompleted = (id: string) => {
			setTasks((prev) =>
				prev.map((t) => {
					if (t.id === id) {
						return {
							...t,
							status: TASK_STATUS.COMPLETED,
						};
					}
					return t;
				})
			);
			toast({
				title: 'Background Task Completed.',
				status: 'success',
				duration: 3000,
				isClosable: true,
			});
		};
		const listenerFailed = (_id: string) => {
			setTasks((prev) => prev.filter(({ id }) => id === _id));
			toast({
				title: 'Background Task Failed.',
				description: 'Some error occurred while running background tasks.',
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
		};
		const listenerCreated = () => {
			TaskService.listTasks().then(setTasks);
		};
		socket.on(SOCKET_EVENT.TASK_COMPLETED, listenerCompleted);
		socket.on(SOCKET_EVENT.TASK_FAILED, listenerFailed);
		socket.on(SOCKET_EVENT.TASK_CREATED, listenerCreated);

		return () => {
			socket.off(SOCKET_EVENT.TASK_COMPLETED, listenerCompleted);
			socket.off(SOCKET_EVENT.TASK_FAILED, listenerFailed);
			socket.off(SOCKET_EVENT.TASK_CREATED, listenerCreated);
		};
	}, [toast]);

	function removeTask(id: string) {
		TaskService.removeTask(id).then(
			(res) => res && setTasks((prev) => prev.filter((t) => t.id !== id))
		);
	}

	function downloadTask(id: string) {
		TaskService.downloadTaskResult(id);
	}
	return { tasks, removeTask, downloadTask };
}
