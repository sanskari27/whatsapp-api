import {
	Box,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	StackDivider,
	Text,
	VStack,
	useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useMemo } from 'react';
import { FaFileExcel } from 'react-icons/fa';
import { TbReport } from 'react-icons/tb';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import useDebounce from '../../../../hooks/useDebounce';
import ReportsService from '../../../../services/reports.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	reset,
	setPollList,
	setSearchText,
	setSelectedPollDetails,
} from '../../../../store/reducers/PollReducers';
import { Poll } from '../../../../store/types/PollState';
import Each from '../../../../utils/Each';
import SearchBar from '../../../components/searchbar';
import PollResponseDialog from './poll-response.component';
import { filterList } from '../../../../utils/listUtils';

const PollReport = () => {
	const dispatch = useDispatch();

	const { isOpen, onOpen, onClose } = useDisclosure();

	const {
		list,
		ui: { searchText },
	} = useSelector((state: StoreState) => state[StoreNames.POLL]);

	const handlePollClick = (poll: Poll) => {
		ReportsService.pollDetails(poll).then((res) => {
			dispatch(setSelectedPollDetails(res));
			onOpen();
		});
	};

	useEffect(() => {
		dispatch(reset());
		ReportsService.listPolls().then((res) => dispatch(setPollList(res)));
	}, [dispatch]);

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(list, _searchText, { title: 1 });
	}, [_searchText, list]);

	return (
		<>
			<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
				<Heading color={Colors.PRIMARY_DARK}>Poll Responses</Heading>
			</Flex>
			<Box marginTop={'1rem'} width={'98%'}>
				<SearchBar text={searchText} onTextChange={(text) => dispatch(setSearchText(text))} />
				<Text textAlign={'right'} color={Colors.PRIMARY_DARK}>
					{filtered.length} records found.
				</Text>
				{
					<VStack alignItems={'flex-start'} pb={'5rem'}>
						<Each
							items={filtered}
							render={(poll) => (
								<Box width={'full'} borderBottom={'1px gray dashed'} py={'1rem'}>
									<Flex alignItems={'center'}>
										<Box flexGrow={1}>
											<Text fontWeight='medium' className='whitespace-break-spaces '>
												{poll.title}
											</Text>
											<HStack
												divider={<StackDivider borderColor={Colors.ACCENT_DARK} />}
												gap={'0.5rem'}
											>
												<Text className='whitespace-break-spaces text-accent-dark'>
													Type: {poll.isMultiSelect ? 'MultiSelect' : 'Single Select'}
												</Text>
												<Text className='whitespace-break-spaces text-accent-dark'>
													{poll.vote_count} Responses Recorded
												</Text>
											</HStack>
										</Box>
										<HStack alignItems={'end'}>
											<IconButton
												size={'sm'}
												aria-label='Delete'
												icon={<Icon as={TbReport} color={'red.500'} />}
												onClick={() => handlePollClick(poll)}
											/>
											<IconButton
												size={'sm'}
												aria-label='Export'
												icon={<Icon as={FaFileExcel} color={'blue.500'} />}
												onClick={() => ReportsService.pollDetails(poll, true)}
											/>
										</HStack>
									</Flex>
								</Box>
							)}
						/>
					</VStack>
				}
			</Box>

			<PollResponseDialog isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default PollReport;
