import {
    Button,
    Checkbox,
    Flex,
    HStack,
    Heading,
    Icon,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import ExportsService from '../../../services/exports.service';
import ReportsService from '../../../services/reports.service';
import { StoreNames, StoreState } from '../../../store';
import { setAllCampaigns } from '../../../store/reducers/SchedulerReducer';
import ConfirmationDialog, {
    ConfirmationDialogHandle,
} from '../../components/confirmation-alert';

const Reports = () => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

    const { all_campaigns } = useSelector(
        (state: StoreState) => state[StoreNames.SCHEDULER]
    );

    const [uiDetails, setUiDetails] = useState<{
        campaignLoading: boolean;
        exportingContact: boolean;
        deletingContact: boolean;
    }>({
        campaignLoading: false,
        exportingContact: false,
        deletingContact: false,
    });

    // add a campaign to the export make a state for it
    const [selectedCampaign, setSelectedCampaign] = useState<string[]>([]);

    const fetchCampaigns = useCallback(() => {
        ReportsService.generateAllCampaigns()
            .then((res) => {
                dispatch(setAllCampaigns(res));
            })
            .finally(() => {
                setUiDetails((prev) => ({ ...prev, campaignLoading: false }));
            });
    }, [dispatch]);

    useEffect(() => {
        setUiDetails((prev) => ({ ...prev, campaignLoading: true }));
        fetchCampaigns();
    }, [dispatch, fetchCampaigns]);

    const exportCampaign = async () => {
        setUiDetails((prev) => ({ ...prev, exportingContact: true }));
        const promises = selectedCampaign.map(async (campaign) => {
            await ExportsService.exportCampaignReport(campaign);
        });
        await Promise.all(promises).then(() => {
            setUiDetails((prev) => ({ ...prev, exportingContact: false }));
            setSelectedCampaign([]);
            fetchCampaigns();
        });
    };

    const deleteCampaign = async () => {
        setUiDetails((prev) => ({ ...prev, deletingContact: true }));
        const promises = selectedCampaign.map(async (campaign) => {
            await ReportsService.deleteCampaign(campaign);
        });
        await Promise.all(promises).then(() => {
            setUiDetails((prev) => ({ ...prev, deletingContact: false }));
            setSelectedCampaign([]);
            fetchCampaigns();
        });
    };

    const removeCampaignList = (campaign_id: string) => {
        setSelectedCampaign((prev) =>
            prev.filter((campaign) => campaign !== campaign_id)
        );
    };

    const addCampaignList = (id: string) => {
        setSelectedCampaign((prev) => [...prev, id]);
    };

    return (
        <Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
            <HStack justifyContent={'space-between'} width={'full'} pb={'2rem'}>
                <Text
                    textColor={theme === 'dark' ? 'white' : 'black'}
                    fontSize={'xl'}
                >
                    <Icon
                        as={FiBarChart2}
                        className="mr-2"
                        size={'1.5rem'}
                        color={'green'}
                    />
                    Campaign Reports
                </Text>
                <HStack justifyContent={'flex-end'} pt={4}>
                    <Button
                        colorScheme={'green'}
                        onClick={exportCampaign}
                        isDisabled={selectedCampaign.length === 0}
                        isLoading={uiDetails.exportingContact}
                    >
                        Export
                    </Button>
                    <Button
                        colorScheme={'red'}
                        onClick={() => confirmationDialogRef.current?.open()}
                        isDisabled={selectedCampaign.length === 0}
                        isLoading={uiDetails.deletingContact}
                    >
                        Delete
                    </Button>
                </HStack>
            </HStack>
            {uiDetails.campaignLoading ? (
                <Heading
                    textAlign={'center'}
                    textColor={theme === 'dark' ? 'whitesmoke' : 'black'}
                >
                    Loading...
                </Heading>
            ) : (
                <>
                    <TableContainer>
                        <Table variant={'unstyled'}>
                            <Thead>
                                <Tr
                                    color={theme === 'dark' ? 'white' : 'black'}
                                >
                                    <Th>Select</Th>
                                    <Th>Campaign Name</Th>
                                    <Th textColor={'green'}>Messages Sent</Th>
                                    <Th textColor={'yellow.500'}>
                                        Messages Pending
                                    </Th>
                                    <Th textColor={'red.400'}>
                                        Messages Failed
                                    </Th>
                                    <Th>Status</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {all_campaigns.map((campaign, index) => (
                                    <Tr
                                        key={index}
                                        bg={
                                            theme === 'light'
                                                ? 'gray.50'
                                                : 'gray.700'
                                        }
                                        color={
                                            theme === 'dark' ? 'white' : 'black'
                                        }
                                    >
                                        <Td>
                                            <Checkbox
                                                colorScheme="green"
                                                mr={4}
                                                isChecked={selectedCampaign.includes(
                                                    campaign.campaign_id
                                                )}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        addCampaignList(
                                                            campaign.campaign_id
                                                        );
                                                    } else {
                                                        removeCampaignList(
                                                            campaign.campaign_id
                                                        );
                                                    }
                                                }}
                                            />
                                            {index + 1}
                                        </Td>
                                        <Td>
                                            {campaign.campaignName.length > 28
                                                ? campaign.campaignName.substring(
                                                      0,
                                                      27
                                                  ) + '...'
                                                : campaign.campaignName}
                                        </Td>

                                        <Td textColor={'green'}>
                                            {campaign.sent}
                                        </Td>
                                        <Td textColor={'yellow.500'}>
                                            {campaign.pending}
                                        </Td>
                                        <Td textColor={'red.400'}>
                                            {campaign.failed}
                                        </Td>
                                        <Td>
                                            {campaign.isPaused ? (
                                                <Button
                                                    size={'sm'}
                                                    colorScheme="green"
                                                    onClick={() => {
                                                        ReportsService.resumeCampaign(
                                                            campaign.campaign_id
                                                        ).then(() => {
                                                            fetchCampaigns();
                                                        });
                                                    }}
                                                >
                                                    Resume
                                                </Button>
                                            ) : campaign.pending !== 0 ? (
                                                <Button
                                                    size={'sm'}
                                                    colorScheme="red"
                                                    onClick={() => {
                                                        ReportsService.pauseCampaign(
                                                            campaign.campaign_id
                                                        ).then(() => {
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
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </>
            )}
            <ConfirmationDialog
                type={'Campaign'}
                ref={confirmationDialogRef}
                onConfirm={deleteCampaign}
            />
        </Flex>
    );
};

export default Reports;
