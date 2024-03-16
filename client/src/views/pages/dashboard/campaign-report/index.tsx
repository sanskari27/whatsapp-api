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
import { FaFileExcel, FaPause, FaPlay } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import useDebounce from '../../../../hooks/useDebounce';
import ReportsService from '../../../../services/reports.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	reset,
	setAllCampaigns,
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
import Filters from './filter.component';

const CampaignReport = () => {
	const dispatch = useDispatch();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

	const {
		all_campaigns,
		ui: { searchText, condition, filterDateStart, filterDateEnd },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const handleTabsChange = (index: number) => {
		if (index === 0) {
			dispatch(setCondition('ALL'));
		} else if (index === 1) {
			dispatch(setCondition('RUNNING'));
		} else if (index === 2) {
			dispatch(setCondition('PAUSED'));
		} else if (index === 3) {
			dispatch(setCondition('COMPLETED'));
		}
	};

	// add a campaign to the export make a state for it

	const fetchCampaigns = useCallback(() => {
		ReportsService.generateAllCampaigns()
			.then((res) => dispatch(setAllCampaigns(res)))
			.finally(() => dispatch(setCampaignLoading(false)));
	}, [dispatch]);

	useEffect(() => {
		dispatch(setCampaignLoading(true));
		dispatch(reset());
		fetchCampaigns();
	}, [fetchCampaigns, dispatch]);

	const deleteCampaign = async (campaign: string) => {
		ReportsService.deleteCampaign(campaign).then((res) => {
			if (res) {
				fetchCampaigns();
			}
		});
	};

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(all_campaigns, _searchText, {
			name: 1,
			customFilter: (item, state) => {
				const parts = item.createdAt.split(' ')[0].split('-');
				const createdAt = new Date(
					parseInt(parts[2], 10),
					parseInt(parts[1], 10) - 1,
					parseInt(parts[0], 10)
				);

				if (
					createdAt.getTime() >= state.filterDateEnd.getTime() ||
					createdAt.getTime() <= state.filterDateStart.getTime()
				) {
					// This means that date is outside of the selection range
					return false;
				}
				if (state.condition === 'RUNNING') {
					return item.pending > 0 && !item.isPaused;
				} else if (state.condition === 'PAUSED') {
					return item.isPaused;
				} else if (state.condition === 'COMPLETED') {
					return item.pending === 0;
				}
				return true;
			},
			customFilterDeps: {
				condition,
				filterDateStart,
				filterDateEnd,
			},
		});
	}, [_searchText, all_campaigns, condition, filterDateEnd, filterDateStart]);

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>Campaigns</Heading>

			<Box marginTop={'1rem'} width={'98%'} pb={'5rem'}>
				<Tabs position='relative' variant={'unstyled'} mb={'1rem'} onChange={handleTabsChange}>
					<TabList>
						<Tab color={Colors.PRIMARY_DARK}>All</Tab>
						<Tab color={Colors.PRIMARY_DARK}>Running</Tab>
						<Tab color={Colors.PRIMARY_DARK}>Paused</Tab>
						<Tab color={Colors.PRIMARY_DARK}>Completed</Tab>
					</TabList>
					<TabIndicator mt='-1.5px' height='2px' bg={Colors.ACCENT_DARK} borderRadius='1px' />
				</Tabs>
				<SearchBar
					text={searchText}
					onTextChange={(text) => dispatch(setSearchText(text))}
					filterComponent={<Filters />}
				/>
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
											>
												<Text textColor={'blue.500'}>[{campaign.createdAt}]</Text>
												{campaign.sent && (
													<Text textColor={Colors.ACCENT_DARK}>Messages sent: {campaign.sent}</Text>
												)}
												{campaign.pending && (
													<Text textColor={'yellow.600'}>Messages pending: {campaign.pending}</Text>
												)}
												{campaign.failed && (
													<Text textColor={'orangered'}>Messages failed: {campaign.failed}</Text>
												)}
											</HStack>
											<Text className='whitespace-break-spaces text-gray-600'>
												{campaign.description}
											</Text>
										</Box>
										<HStack alignItems={'end'}>
											{campaign.pending === 0 ? null : campaign.isPaused ? (
												<IconButton
													size={'sm'}
													aria-label='Play'
													icon={<Icon as={FaPlay} height={'18px'} color={'yellowgreen'} />}
													onClick={() =>
														ReportsService.resumeCampaign(campaign.campaign_id).then(fetchCampaigns)
													}
												/>
											) : (
												<IconButton
													size={'sm'}
													aria-label='Pause'
													icon={<Icon as={FaPause} height={'18px'} color={'yellow.500'} />}
													onClick={() =>
														ReportsService.pauseCampaign(campaign.campaign_id).then(fetchCampaigns)
													}
												/>
											)}
											<IconButton
												size={'sm'}
												aria-label='Export'
												icon={<Icon as={FaFileExcel} color={'blue.500'} />}
												onClick={() => ReportsService.generateReport(campaign.campaign_id)}
											/>
											<IconButton
												size={'sm'}
												aria-label='Delete'
												icon={<Icon as={MdDelete} color={'red.500'} />}
												onClick={() => confirmationDialogRef.current?.open(campaign.campaign_id)}
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
				type={'Campaign'}
				ref={confirmationDialogRef}
				disclaimer={'This will pause the campaign.'}
				onConfirm={deleteCampaign}
			/>
		</Flex>
	);
};

export default CampaignReport;
