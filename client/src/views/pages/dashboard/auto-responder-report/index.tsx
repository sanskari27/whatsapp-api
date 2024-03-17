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
import { useMemo, useRef } from 'react';
import { FiEdit, FiPause, FiPlay } from 'react-icons/fi';
import { MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import useDebounce from '../../../../hooks/useDebounce';
import BotService from '../../../../services/bot.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	removeBot,
	setCondition,
	setSearchText,
	updateBot,
} from '../../../../store/reducers/BotReducers';
import Each from '../../../../utils/Each';
import { filterList } from '../../../../utils/listUtils';
import ConfirmationDialog, {
	ConfirmationDialogHandle,
} from '../../../components/confirmation-alert';
import SearchBar from '../../../components/searchbar';

const AutoResponderReport = () => {
	const dispatch = useDispatch();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

	const {
		all_bots,
		ui: { searchText, condition },
	} = useSelector((state: StoreState) => state[StoreNames.CHATBOT]);

	const handleTabsChange = (index: number) => {
		if (index === 0) {
			dispatch(setCondition('ALL'));
		} else if (index === 1) {
			dispatch(setCondition('RUNNING'));
		} else if (index === 2) {
			dispatch(setCondition('PAUSED'));
		}
	};

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(all_bots, _searchText, {
			trigger: 1,
			message: 1,
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
	}, [_searchText, all_bots, condition]);

	const handleDelete = (id: string) => {
		BotService.deleteBot(id).then((res) => {
			if (!res) return;
			dispatch(removeBot(id));
		});
	};

	const toggleActive = (id: string) => {
		BotService.toggleBot(id).then((res) => {
			if (!res) {
				return;
			}
			dispatch(updateBot({ id, data: res }));
		});
	};

	const downloadReport = (id: string) => {
		BotService.downloadResponses(id);
	};

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>Auto Responders</Heading>

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
							render={(bot) => (
								<Box width={'full'} borderBottom={'1px gray dashed'} py={'1rem'}>
									<Flex alignItems={'center'}>
										<Box flexGrow={1}>
											<Text fontWeight='medium' className='whitespace-break-spaces'>
												{bot.trigger}
											</Text>
											<HStack
												divider={<StackDivider borderColor={Colors.ACCENT_DARK} />}
												gap={'0.5rem'}
												textColor={Colors.ACCENT_DARK}
											>
												<Text>
													Time Window: [{bot.startAt} - {bot.endAt}]
												</Text>
												<Text textTransform={'capitalize'}>
													Target Audience: {bot.respond_to.toLowerCase().split('_').join(' ')}
												</Text>
												<Text> Attachments: {bot.attachments.length}</Text>
												<Text> Contacts: {bot.contacts.length}</Text>
												<Text> Polls: {bot.polls.length}</Text>
											</HStack>
											<Text className='whitespace-break-spaces text-gray-600'>{bot.message}</Text>
										</Box>
										<HStack alignItems={'end'}>
											<IconButton
												aria-label='toggle-scheduler'
												size={'sm'}
												icon={bot.isActive ? <FiPause /> : <FiPlay />}
												onClick={() => toggleActive(bot.bot_id)}
											/>
											<Link
												to={NAVIGATION.CAMPAIGNS + NAVIGATION.AUTO_RESPONDER + '/' + bot.bot_id}
											>
												<IconButton
													aria-label='edit-scheduler'
													size={'sm'}
													icon={<FiEdit />}
													colorScheme='gray'
												/>
											</Link>
											<IconButton
												aria-label='download-messages'
												icon={<DownloadIcon />}
												onClick={() => downloadReport(bot.bot_id)}
												size='sm'
											/>
											<IconButton
												aria-label='delete-scheduler'
												size={'sm'}
												icon={<Icon as={MdDelete} color={'red.500'} />}
												onClick={() => confirmationDialogRef.current?.open(bot.bot_id)}
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
				type={'Auto Responder'}
				ref={confirmationDialogRef}
				onConfirm={handleDelete}
			/>
		</Flex>
	);
};

export default AutoResponderReport;
