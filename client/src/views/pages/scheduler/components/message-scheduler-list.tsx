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
} from '@chakra-ui/react';
import { FiEdit, FiPause, FiPlay } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
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
	const { all_schedulers } = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const handleSchedulerToggleActive = (id: string) => {
		MessageService.toggleScheduledMessage(id)
			.then((res) => {
				if (!res) return;
				dispatch(editSelectedScheduler(res));
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const handleDeleteScheduledMessage = (id: string) => {
		MessageService.deleteScheduledMessage(id)
			.then((res) => {
				if (!res) return;
				dispatch(deleteScheduler(id));
			})
			.catch((err) => {
				console.log(err);
			});
	};

	return (
		<TableContainer mt={'1rem'}>
			<Table>
				<Thead>
					<Tr>
						<Th>Title</Th>
						<Th width={'60%'}>Message</Th>
						<Th width={'10%'}>Start Time</Th>
						<Th width={'10%'}>End Time</Th>
						<Th width={'10%'}>Attachments/Contacts/Polls</Th>
						<Th width={'10%'}>Action</Th>
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
										aria-label='toggle-scheduler'
										icon={scheduler.isActive ? <FiPause /> : <FiPlay />}
										onClick={() => {
											handleSchedulerToggleActive(scheduler.id);
										}}
										colorScheme={scheduler.isActive ? 'red' : 'green'}
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
