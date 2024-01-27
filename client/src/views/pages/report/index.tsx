import { DeleteIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Checkbox,
	Flex,
	HStack,
	Icon,
	IconButton,
	SkeletonCircle,
	SkeletonText,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import useFilteredList from '../../../hooks/useFilteredList';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import ReportsService from '../../../services/reports.service';
import { StoreNames, StoreState } from '../../../store';
import {
	setAllCampaigns,
	setCampaignLoading,
	setDeletingCampaign,
	setExportingCampaign,
} from '../../../store/reducers/SchedulerReducer';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import { NavbarSearchElement } from '../../components/navbar';

const Reports = () => {
	const dispatch = useDispatch();
	const theme = useTheme();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

	const {
		all_campaigns,
		ui: { campaignLoading, deletingCampaign, exportingCampaign },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	// add a campaign to the export make a state for it
	const [selectedCampaign, setSelectedCampaign] = useState<string[]>([]);

	const exportCampaign = useCallback(
		async (selectedCampaigns: string[]) => {
			dispatch(setExportingCampaign(true));
			const promises = selectedCampaigns.map(async (campaign) => {
				await ReportsService.generateReport(campaign);
			});
			await Promise.all(promises).then(() => {
				dispatch(setExportingCampaign(false));
				setSelectedCampaign([]);
			});
		},
		[dispatch]
	);

	useEffect(() => {
		pushToNavbar({
			title: 'Campaign Reports',
			icon: FiBarChart2,
			link: NAVIGATION.REPORTS,
			actions: (
				<HStack>
					<NavbarSearchElement />
					<IconButton
						aria-label='delete'
						isDisabled={selectedCampaign.length === 0}
						icon={<Icon as={DeleteIcon} height={5} width={5} />}
						colorScheme={'red'}
						size={'sm'}
						onClick={() => {
							confirmationDialogRef.current?.open('');
						}}
					/>
					<Button
						colorScheme={'green'}
						size={'sm'}
						onClick={() => exportCampaign(selectedCampaign)}
						isDisabled={selectedCampaign.length === 0}
						isLoading={exportingCampaign}
					>
						Export
					</Button>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [
		deletingCampaign,
		selectedCampaign.length,
		exportCampaign,
		exportingCampaign,
		selectedCampaign,
	]);

	const fetchCampaigns = useCallback(() => {
		ReportsService.generateAllCampaigns()
			.then((res) => {
				dispatch(setAllCampaigns(res));
			})
			.finally(() => {
				dispatch(setCampaignLoading(false));
			});
	}, [dispatch]);

	useEffect(() => {
		dispatch(setCampaignLoading(true));
		fetchCampaigns();
	}, [dispatch, fetchCampaigns]);

	const deleteCampaign = async () => {
		dispatch(setDeletingCampaign(true));
		const promises = selectedCampaign.map(async (campaign) => {
			await ReportsService.deleteCampaign(campaign);
		});
		await Promise.all(promises).then(() => {
			dispatch(setDeletingCampaign(false));
			setSelectedCampaign([]);
			fetchCampaigns();
		});
	};

	const removeCampaignList = (campaign_id: string) => {
		setSelectedCampaign((prev) => prev.filter((campaign) => campaign !== campaign_id));
	};

	const addCampaignList = (id: string) => {
		setSelectedCampaign((prev) => [...prev, id]);
	};

	const filtered = useFilteredList(all_campaigns, { campaignName: 1 });

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<TableContainer>
				<Table variant={'unstyled'}>
					<Thead>
						<Tr color={theme === 'dark' ? 'white' : 'black'}>
							<Th width={'5%'}>Select</Th>
							<Th width={'50%'}>Campaign Name</Th>
							<Th width={'5%'}>Created At</Th>
							<Th width={'10%'} textColor={'green'} isNumeric>
								Messages Sent
							</Th>
							<Th width={'10%'} textColor={'yellow.500'} isNumeric>
								Messages Pending
							</Th>
							<Th width={'10%'} textColor={'red.400'} isNumeric>
								Messages Failed
							</Th>
							<Th width={'10%'}>Status</Th>
						</Tr>
					</Thead>
					<Tbody>
						{campaignLoading && all_campaigns.length === 0 ? (
							<Tr
								bg={theme === 'light' ? 'gray.50' : 'gray.700'}
								color={theme === 'dark' ? 'white' : 'black'}
							>
								<Td>
									<SkeletonCircle size='10' />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
							</Tr>
						) : (
							filtered.map((campaign, index) => (
								<Tr key={index} color={theme === 'dark' ? 'white' : 'black'}>
									<Td>
										<Checkbox
											colorScheme='green'
											mr={4}
											isChecked={selectedCampaign.includes(campaign.campaign_id)}
											onChange={(e) => {
												if (e.target.checked) {
													addCampaignList(campaign.campaign_id);
												} else {
													removeCampaignList(campaign.campaign_id);
												}
											}}
										/>
										{index + 1}.
									</Td>
									<Td>
										{campaign.campaignName.length > 28
											? campaign.campaignName.substring(0, 27) + '...'
											: campaign.campaignName}
									</Td>
									<Td>
										{campaign.createdAt.split(' ').map((time, index) => (
											<Box key={index}>{time}</Box>
										))}
									</Td>
									<Td textColor={'green'}>{campaign.sent}</Td>
									<Td textColor={'yellow.500'}>{campaign.pending}</Td>
									<Td textColor={'red.400'}>{campaign.failed}</Td>
									<Td>
										{campaign.isPaused ? (
											<Button
												size={'sm'}
												colorScheme='green'
												onClick={() => {
													ReportsService.resumeCampaign(campaign.campaign_id).then(() => {
														fetchCampaigns();
													});
												}}
											>
												Resume
											</Button>
										) : campaign.pending !== 0 ? (
											<Button
												size={'sm'}
												colorScheme='red'
												onClick={() => {
													ReportsService.pauseCampaign(campaign.campaign_id).then(() => {
														fetchCampaigns();
													});
												}}
											>
												Pause
											</Button>
										) : (
											'Campaign Completed'
										)}
									</Td>
								</Tr>
							))
						)}
					</Tbody>
				</Table>
			</TableContainer>
			<ConfirmationDialog
				type={'Campaign'}
				ref={confirmationDialogRef}
				onConfirm={deleteCampaign}
			/>
		</Flex>
	);
};

function LineSkeleton() {
	return <SkeletonText mt='4' noOfLines={1} spacing='4' skeletonHeight='4' rounded={'md'} />;
}

export default Reports;
