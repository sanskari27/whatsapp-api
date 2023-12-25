import {
    Button,
    Checkbox,
    HStack,
    Heading,
    Table,
    TableContainer,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import ExportsService from '../../../services/exports.service';
import ReportsService from '../../../services/reports.service';
import { StoreNames, StoreState } from '../../../store';
import { setAllCampaigns } from '../../../store/reducers/SchedulerReducer';

const Reports = () => {
    const dispatch = useDispatch();
    const theme = useTheme();

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

    const fetchCampaigns = () => {
        ReportsService.generateAllCampaigns()
            .then((res) => {
                dispatch(setAllCampaigns(res));
            })
            .finally(() => {
                setUiDetails((prev) => ({ ...prev, campaignLoading: false }));
            });
    };

    useEffect(() => {
        setUiDetails((prev) => ({ ...prev, campaignLoading: true }));
        fetchCampaigns();
    }, []);

    const exportCampaign = async () => {
        setUiDetails((prev) => ({ ...prev, exportingContact: true }));
        for (let i = 0; i < selectedCampaign.length; i++) {
            await ExportsService.exportCampaignReport(selectedCampaign[i]);
            if (i === selectedCampaign.length - 1) {
                setUiDetails((prev) => ({ ...prev, exportingContact: false }));
                setSelectedCampaign([]);
            }
        }
    };

    const deleteCampaign = async () => {
        setUiDetails((prev) => ({ ...prev, deletingContact: true }));
        for (let i = 0; i < selectedCampaign.length; i++) {
            await ReportsService.deleteCampaign(selectedCampaign[i]);
            if (i === selectedCampaign.length - 1) {
                setUiDetails((prev) => ({ ...prev, deletingContact: false }));
                setSelectedCampaign([]);
                fetchCampaigns();
            }
        }
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
        <VStack padding={'1rem'} justifyContent={'start'}>
            <Heading
                textAlign={'left'}
                color={theme === 'dark' ? 'white' : 'black'}
            >
                Reports
            </Heading>
            {uiDetails.campaignLoading ? (
                <Heading textAlign={'left'}>Loading...</Heading>
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
                                    <Th>Messages Sent</Th>
                                    <Th>Messages Pending</Th>
                                    <Th>Messages Failed</Th>
                                    <Th>Pause/Resume</Th>
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
                                        </Td>
                                        <Td>{campaign.campaignName}</Td>
                                        <Td>{campaign.sent}</Td>
                                        <Td>{campaign.pending}</Td>
                                        <Td>{campaign.failed}</Td>
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
                        <HStack justifyContent={'flex-end'} pt={4}>
                            <Button
                                size={'sm'}
                                colorScheme={'green'}
                                onClick={exportCampaign}
                                isDisabled={selectedCampaign.length === 0}
                                isLoading={uiDetails.exportingContact}
                            >
                                Export
                            </Button>
                            <Button
                                size={'sm'}
                                colorScheme={'red'}
                                onClick={deleteCampaign}
                                isDisabled={selectedCampaign.length === 0}
                                isLoading={uiDetails.deletingContact}
                            >
                                Delete
                            </Button>
                        </HStack>
                    </TableContainer>
                </>
            )}
        </VStack>
    );
};

export default Reports;
