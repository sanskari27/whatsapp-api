import { DownloadIcon } from '@chakra-ui/icons';
import {
	Box,
	HStack,
	IconButton,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useToast,
} from '@chakra-ui/react';
import { FiEdit, FiPause, FiPlay } from 'react-icons/fi';
import { MdDelete, MdScheduleSend } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import MessageService from '../../../../services/message.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	deleteScheduler,
	editSelectedScheduler,
	setSelectedScheduler,
} from '../../../../store/reducers/SchedulerReducer';

const MessageSchedulerList = () => {
	const dispatch = useDispatch();
	const toast = useToast();
	const { all_schedulers } = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const handleSchedulerToggleActive = (id: string) => {
		MessageService.toggleScheduledMessage(id).then((res) => {
			if (!res) return;
			dispatch(editSelectedScheduler(res));
		});
	};

	const handleDeleteScheduledMessage = (id: string) => {
		MessageService.deleteScheduledMessage(id).then((res) => {
			if (!res) return;
			dispatch(deleteScheduler(id));
		});
	};

	const downloadSchedulerReport = (id: string) => {
		MessageService.generateScheduledMessagesReport(id);
	};
	const reschedule = async (id: string) => {
		const rescheduled = await MessageService.reschedule(id);
		if (rescheduled) {
			toast({
				title: 'Messages Scheduled.',
				duration: 1500,
				status: 'success',
			});
		} else {
			toast({
				title: 'Messages Scheduling Failed.',
				duration: 1500,
				status: 'error',
			});
		}
	};

	return (
		<TableContainer mt={'1rem'}>
			<Table>
				<Thead>
					<Tr>
						<Th>Title</Th>
						<Th>Message</Th>
						<Th>Start Time</Th>
						<Th>End Time</Th>
						<Th>Attachments/Contacts/Polls</Th>
						<Th>Action</Th>
					</Tr>
				</Thead>
				<Tbody>
					{all_schedulers.map((scheduler, index) => (
						<Tr key={index}>
							<Td>{scheduler.title}</Td>
							<Td>
								{scheduler.message.split('\n').map((message, index) => (
									<Box key={index}>{message}</Box>
								))}
							</Td>
							<Td>{scheduler.start_from}</Td>
							<Td>{scheduler.end_at}</Td>
							<Td>
								{scheduler.attachments.length}/{scheduler.shared_contact_cards.length}/
								{scheduler.polls.length}
							</Td>
							<Td>
								<HStack>
									<IconButton
										aria-label='download-scheduled-messages'
										icon={<DownloadIcon />}
										onClick={() => {
											downloadSchedulerReport(scheduler.id);
										}}
									/>
									<IconButton
										aria-label='toggle-scheduler'
										icon={scheduler.isActive ? <FiPause /> : <FiPlay />}
										onClick={() => {
											handleSchedulerToggleActive(scheduler.id);
										}}
										colorScheme={scheduler.isActive ? 'yellow' : 'blue'}
									/>
									<IconButton
										aria-label='edit-scheduler'
										icon={<FiEdit />}
										onClick={() => {
											dispatch(setSelectedScheduler(scheduler));
										}}
										colorScheme='gray'
									/>
									<IconButton
										aria-label='re-schedule'
										icon={<MdScheduleSend />}
										onClick={() => {
											reschedule(scheduler.id);
										}}
										colorScheme='gray'
									/>

									<IconButton
										aria-label='delete-scheduler'
										icon={<MdDelete />}
										onClick={() => handleDeleteScheduledMessage(scheduler.id)}
										colorScheme='red'
									/>
								</HStack>
							</Td>
						</Tr>
					))}
				</Tbody>
			</Table>
		</TableContainer>
	);
};

export default MessageSchedulerList;
