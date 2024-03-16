import { DownloadIcon } from '@chakra-ui/icons';
import {
	Box,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	StackDivider,
	Tab,
	TabIndicator,
	TabList,
	Tabs,
	Text,
	VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FiEdit, FiPause, FiPlay } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import useDebounce from '../../../../hooks/useDebounce';
import MessageService from '../../../../services/message.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	deleteScheduler,
	editSelectedScheduler,
	reset,
	setAllSchedulers,
	setCampaignLoading,
	setCondition,
	setSearchText,
} from '../../../../store/reducers/SchedulerReducer';
import Each from '../../../../utils/Each';
import { filterList } from '../../../../utils/listUtils';
import ConfirmationDialog, {
	ConfirmationDialogHandle,
} from '../../../components/confirmation-alert';
import SearchBar from '../../../components/searchbar';

const DailyMessengerReport = () => {
	const dispatch = useDispatch();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

	const {
		all_schedulers,
		ui: { searchText, condition },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const handleTabsChange = (index: number) => {
		if (index === 0) {
			dispatch(setCondition('ALL'));
		} else if (index === 1) {
			dispatch(setCondition('RUNNING'));
		} else if (index === 2) {
			dispatch(setCondition('PAUSED'));
		}
	};

	// add a campaign to the export make a state for it

	const fetchMessengers = useCallback(() => {
		dispatch(setCampaignLoading(true));
		dispatch(reset());
		MessageService.getDailyMessenger()
			.then((res) => dispatch(setAllSchedulers(res)))
			.finally(() => dispatch(setCampaignLoading(false)));
	}, [dispatch]);

	useEffect(() => {
		fetchMessengers();
	}, [fetchMessengers]);

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(all_schedulers, _searchText, {
			name: 1,
			customFilter: (item, state) => {
				if (state.condition === 'RUNNING') {
					return item.isActive;
				} else if (state.condition === 'PAUSED') {
					return !item.isActive;
				}
				return true;
			},
			customFilterDeps: {
				condition,
			},
		});
	}, [_searchText, all_schedulers, condition]);

	const handleSchedulerToggleActive = (id: string) => {
		MessageService.toggleDailyMessenger(id).then((res) => {
			if (!res) return;
			dispatch(editSelectedScheduler(res));
		});
	};

	const handleDeleteScheduledMessage = (id: string) => {
		MessageService.deleteDailyMessenger(id).then((res) => {
			if (!res) return;
			dispatch(deleteScheduler(id));
		});
	};

	const downloadSchedulerReport = (id: string) => {
		MessageService.generateDailyMessengerReport(id);
	};

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>Daily Messengers</Heading>

			<Box marginTop={'1rem'} width={'98%'} pb={'5rem'}>
				<Tabs position='relative' variant={'unstyled'} mb={'1rem'} onChange={handleTabsChange}>
					<TabList>
						<Tab color={Colors.PRIMARY_DARK}>All</Tab>
						<Tab color={Colors.PRIMARY_DARK}>Running</Tab>
						<Tab color={Colors.PRIMARY_DARK}>Paused</Tab>
					</TabList>
					<TabIndicator mt='-1.5px' height='2px' bg={Colors.ACCENT_DARK} borderRadius='1px' />
				</Tabs>
				<SearchBar text={searchText} onTextChange={(text) => dispatch(setSearchText(text))} />
				<Text textAlign={'right'} color={Colors.PRIMARY_DARK}>
					{filtered.length} records found.
				</Text>
				{
					<VStack alignItems={'flex-start'}>
						<Each
							items={filtered}
							render={(campaign) => (
								<Box width={'full'} borderBottom={'1px gray dashed'} py={'1rem'}>
									<Flex alignItems={'center'}>
										<Box flexGrow={1}>
											<Text fontWeight='medium' className='whitespace-break-spaces'>
												{campaign.name}
											</Text>
											<HStack
												divider={<StackDivider borderColor={Colors.ACCENT_DARK} />}
												gap={'0.5rem'}
												textColor={Colors.ACCENT_DARK}
											>
												<Text>
													Time Window: [{campaign.startAt} - {campaign.endAt}]
												</Text>
												<Text>Attachments: {campaign.attachments.length}</Text>
												<Text>Contacts: {campaign.contacts.length}</Text>
												<Text>Polls: {campaign.polls.length}</Text>
											</HStack>
											<Text className='whitespace-break-spaces text-gray-600'>
												{campaign.description}
											</Text>
											<Text className='whitespace-break-spaces text-gray-600'>
												{campaign.message}
											</Text>
										</Box>
										<HStack alignItems={'end'}>
											<IconButton
												aria-label='toggle-scheduler'
												icon={campaign.isActive ? <FiPause /> : <FiPlay />}
												onClick={() => handleSchedulerToggleActive(campaign.id)}
												size='sm'
											/>
											<Link
												to={NAVIGATION.CAMPAIGNS + NAVIGATION.DAILY_MESSENGER + '/' + campaign.id}
											>
												<IconButton aria-label='edit-scheduler' icon={<FiEdit />} size='sm' />
											</Link>
											<IconButton
												aria-label='download-scheduled-messages'
												icon={<DownloadIcon />}
												onClick={() => downloadSchedulerReport(campaign.id)}
												size='sm'
											/>
											<IconButton
												aria-label='delete-scheduler'
												icon={<Icon as={MdDelete} color={'red.500'} />}
												onClick={() => confirmationDialogRef.current?.open(campaign.id)}
												size='sm'
											/>
										</HStack>
									</Flex>
								</Box>
							)}
						/>
					</VStack>
				}
			</Box>
			<ConfirmationDialog
				type={'Daily Messenger'}
				ref={confirmationDialogRef}
				disclaimer={'This will pause the campaign.'}
				onConfirm={handleDeleteScheduledMessage}
			/>
		</Flex>
	);
};

export default DailyMessengerReport;
