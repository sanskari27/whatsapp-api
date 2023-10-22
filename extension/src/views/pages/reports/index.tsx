import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	Button,
	Center,
	Flex,
	Icon,
	Text,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { TbReportAnalytics } from 'react-icons/tb';
import ReportsService from '../../../services/reports.service';

const Reports = () => {
	const [campaigns, setCampaigns] = useState<
		{
			campaign_id: string;
			campaignName: string;
			sent: number;
			failed: number;
			pending: number;
			isPaused: boolean;
		}[]
	>([]);

	useEffect(() => {
		ReportsService.generateAllCampaigns().then(setCampaigns);
	}, []);

	return (
		<Flex direction={'column'} gap={'0.5rem'} justifyContent={'space-between'} height={'full'}>
			<Flex direction={'column'} gap={'0.5rem'}>
				<Flex alignItems='center' gap={'0.5rem'} mt={'1.5rem'}>
					<Icon as={TbReportAnalytics} height={5} width={5} color={'green.400'} />
					<Text className='text-black dark:text-white' fontSize='md'>
						Message Reports
					</Text>
				</Flex>

				<Flex
					direction={'column'}
					// className='bg-[#ECECEC] dark:bg-[#535353]'
					// px={'0.5rem'}
					borderRadius={'20px'}
					mb={'1rem'}
					gap={2}
				>
					<Accordion allowToggle allowMultiple borderWidth={'1px'} rounded='md'>
						{campaigns.map((campaign) => (
							<AccordionItem
								key={campaign.campaign_id}
								className='text-background-dark dark:text-background'
							>
								<h2>
									<AccordionButton>
										<Box as='span' flex='1' textAlign='left'>
											{campaign.campaignName}
										</Box>
										<AccordionIcon />
									</AccordionButton>
								</h2>
								<AccordionPanel pb={2}>
									<Flex fontSize={'sm'} justifyContent={'space-between'}>
										<Text color={'green.400'}>{campaign.sent} Sent</Text>
										<Text color={'yellow.400'}>{campaign.pending} Pending</Text>
										<Text color={'red.400'}>{campaign.failed} Failed</Text>
									</Flex>
									<Center hidden={campaign.pending === 0}>
										{campaign.isPaused ? (
											<Button
												colorScheme='blue'
												variant='outline'
												size={'xs'}
												onClick={async () => {
													await ReportsService.resumeCampaign(campaign.campaign_id);
													ReportsService.generateAllCampaigns().then(setCampaigns);
												}}
											>
												Resume
											</Button>
										) : (
											<Button
												colorScheme='blue'
												variant='outline'
												size={'xs'}
												onClick={async () => {
													await ReportsService.pauseCampaign(campaign.campaign_id);
													ReportsService.generateAllCampaigns().then(setCampaigns);
												}}
											>
												Pause
											</Button>
										)}
									</Center>
								</AccordionPanel>
							</AccordionItem>
						))}
					</Accordion>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default Reports;
