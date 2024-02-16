import {
	Box,
	Button,
	Flex,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Table,
	TableContainer,
	Tabs,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';
import { Cell, Pie, PieChart } from 'recharts';
import ReportsService from '../../../../services/reports.service';
import { StoreNames, StoreState } from '../../../../store';

type PollResponseDialogProps = {
	isOpen: boolean;
	onClose: () => void;
};

const PollResponseDialog = ({ onClose, isOpen }: PollResponseDialogProps) => {
	const { selectedPollDetails } = useSelector((store: StoreState) => store[StoreNames.POLL]);

	if (!selectedPollDetails) return null;

	const downloadReport = async () => {
		ReportsService.pollDetails({ ...selectedPollDetails[0] }, true);
	};

	const getOptionResponses = (
		pollDetails: {
			group_name: string;
			isMultiSelect: boolean;
			options: string[];
			selected_option: string[];
			title: string;
			voted_at: string;
			voter_name: string;
			voter_number: string;
		}[]
	) => {
		const responseCounts: { [key: string]: number } = {};
		pollDetails.forEach((poll) => {
			poll.selected_option.forEach((option) => {
				if (responseCounts[option]) {
					responseCounts[option] += 1;
				} else {
					responseCounts[option] = 1;
				}
			});
		});

		return Object.entries(responseCounts).map(([name, value]) => ({ name, value }));
	};

	const COLORS = selectedPollDetails[0].options.map(
		(_option, index) => `hsl(${(index * 360) / selectedPollDetails[0].options.length}, 100%, 50%)`
	);

	const RADIAN = Math.PI / 180;
	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percent,
	}: {
		cx: number;
		cy: number;
		midAngle: number;
		innerRadius: number;
		outerRadius: number;
		percent: number;
	}) => {
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
			<text
				x={x}
				y={y}
				fill='white'
				textAnchor={x > cx ? 'start' : 'end'}
				dominantBaseline='central'
			>
				{`${(percent * 100).toFixed(0)}%`}
			</text>
		);
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'5xl'} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Modal Title</ModalHeader>
				<ModalBody>
					<Tabs isFitted variant='enclosed'>
						<TabList>
							<Tab>Details</Tab>
							<Tab>Responses</Tab>
						</TabList>

						<TabPanels>
							<TabPanel>
								<TableContainer>
									<Table>
										<Thead>
											<Tr>
												<Th width={'40%'}>Title</Th>
												<Th width={'40%'}>Options</Th>
												<Th width={'10%'}>Multiple Response</Th>
											</Tr>
										</Thead>
										<Tbody>
											<Tr>
												<Td>{selectedPollDetails[0].title}</Td>
												<Td>
													{selectedPollDetails[0].options.map((option, index) => (
														<Box key={index} as={'span'} mr={'0.5rem'}>
															{option}
														</Box>
													))}
												</Td>
												<Td>{selectedPollDetails[0].isMultiSelect ? 'Yes' : 'No'}</Td>
											</Tr>
										</Tbody>
									</Table>
								</TableContainer>
								<Box>
									{getOptionResponses(selectedPollDetails).length === 0 ? (
										<Box mt={'2rem'}>No responses yet</Box>
									) : (
										<Flex justifyContent={'center'} alignItems={'flex-start'} mt={'2rem'}>
											<PieChart width={800} height={300}>
												<Pie
													data={getOptionResponses(selectedPollDetails)}
													outerRadius={150}
													fill='#8884d8'
													paddingAngle={0}
													dataKey='value'
													label={renderCustomizedLabel}
													labelLine={false}
												>
													{getOptionResponses(selectedPollDetails).map((_entry, index) => (
														<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
													))}
												</Pie>
											</PieChart>
											<Box>
												<Box>
													{getOptionResponses(selectedPollDetails).map((_entry, index) => (
														<Box key={index} mr={'0.5rem'}>
															<Box
																as='span'
																bgColor={COLORS[index % COLORS.length]}
																w={'1rem'}
																h={'1rem'}
																display={'inline-block'}
																mr={'0.5rem'}
															></Box>
															{selectedPollDetails[0].options[index]}
														</Box>
													))}
												</Box>
											</Box>
										</Flex>
									)}
								</Box>
							</TabPanel>
							<TabPanel>
								<TableContainer>
									<Table>
										<Thead>
											<Tr>
												<Th>Sl no</Th>
												<Th>Name</Th>
												<Th>Number</Th>
												<Th>Response</Th>
											</Tr>
										</Thead>
										<Tbody>
											{selectedPollDetails?.map((poll, index) => (
												<Tr key={index}>
													<Td>{index + 1}</Td>
													<Td>{poll.voter_name}</Td>
													<Td>{poll.voter_number}</Td>
													<Td>
														{poll.selected_option.map((option, index) => (
															<Box as={'span'} mr={'0.5rem'} key={index}>
																{option}
															</Box>
														))}
													</Td>
												</Tr>
											))}
										</Tbody>
									</Table>
								</TableContainer>
							</TabPanel>
						</TabPanels>
					</Tabs>
				</ModalBody>

				<ModalFooter>
					<Flex width={'full'} justifyContent={'space-between'}>
						<Button colorScheme='blue' mr={3} onClick={downloadReport}>
							Download Report
						</Button>
						<Button colorScheme='green' mr={3} onClick={onClose}>
							Close
						</Button>
					</Flex>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default PollResponseDialog;
