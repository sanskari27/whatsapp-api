import {
	Box,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { BiPoll } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import ReportsService from '../../../services/reports.service';
import { StoreNames, StoreState } from '../../../store';
import { setPollList, setSelectedPollDetails } from '../../../store/reducers/PollReducers';
import { Poll } from '../../../store/types/PollState';
import PollResponseDialog from './components/poll-response';

const PollReport = () => {
	const dispatch = useDispatch();

	const { isOpen, onOpen, onClose } = useDisclosure();

	const { list } = useSelector((state: StoreState) => state[StoreNames.POLL]);

	const handlePollClick = (poll: Poll) => {
		ReportsService.pollDetails(poll).then((res) => {
			dispatch(setSelectedPollDetails(res));
			onOpen();
		});
	};

	useEffect(() => {
		ReportsService.listPolls().then((res) => dispatch(setPollList(res)));
	}, [dispatch]);

	useEffect(() => {
		pushToNavbar({
			title: 'Polls Reports',
			icon: BiPoll,
		});
		return () => {
			popFromNavbar();
		};
	}, []);

	return (
		<>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th width={'5%'}>Sl No</Th>
							<Th width={'40%'}>Title</Th>
							<Th width={'40%'}>Options</Th>
							<Th width={'10%'}>Multiple Response</Th>
						</Tr>
					</Thead>
					<Tbody>
						{list.map((poll, index) => (
							<Tr
								key={index}
								onClick={() => handlePollClick(poll)}
								_hover={{ bgColor: 'gray.100', cursor: 'pointer' }}
							>
								<Td>{index + 1}</Td>
								<Td>{poll.title}</Td>
								<Td>
									{poll.options.map((option) => (
										<Box>{option}</Box>
									))}
								</Td>
								<Td>{poll.isMultiSelect ? 'Yes' : 'No'}</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			<PollResponseDialog isOpen={isOpen} onClose={onClose} />
			</TableContainer>
		</>
	);
};

export default PollReport;
