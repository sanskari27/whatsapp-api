import {
	Box,
	HStack,
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
import useFilteredList from '../../../hooks/useFilteredList';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import ReportsService from '../../../services/reports.service';
import { StoreNames, StoreState } from '../../../store';
import { setPollList, setSelectedPollDetails } from '../../../store/reducers/PollReducers';
import { Poll } from '../../../store/types/PollState';
import { NavbarSearchElement } from '../../components/navbar';
import PollResponseDialog from './components/poll-response';
import { useTheme } from '../../../hooks/useTheme';

const PollReport = () => {
	const dispatch = useDispatch();
	const theme = useTheme()

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
			actions: (
				<HStack>
					<NavbarSearchElement />
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, []);
	const filtered = useFilteredList(list, { title: 1 });

	return (
		<>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'5%'}>
								Sl No
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'40%'}>
								Title
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'40%'}>
								Options
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'10%'}>
								Multiple Response
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{filtered.map((poll, index) => (
							<Tr
								key={index}
								onClick={() => handlePollClick(poll)}
								_hover={{ bgColor: theme === 'dark' ? 'grey' : 'whitesmoke', cursor: 'pointer' }}
								color={theme === 'dark' ? 'whitesmoke' : 'black'}
							>
								<Td>{index + 1}</Td>
								<Td>{poll.title}</Td>
								<Td>
									{poll.options.map((option, index) => (
										<Box key={index}>{option}</Box>
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
