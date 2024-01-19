import {
	Box,
	Button,
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
import { StoreNames, StoreState } from '../../../../store';

type PollResponseDialogProps = {
	isOpen: boolean;
	onClose: () => void;
};

const PollResponseDialog = ({ onClose, isOpen }: PollResponseDialogProps) => {
	const { selectedPollDetails } = useSelector((store: StoreState) => store[StoreNames.POLL]);

	if (!selectedPollDetails) return null;

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
		const responseCounts = pollDetails.reduce((acc, curr) => {
			curr.selected_option.forEach((option) => {
				if (acc[option as keyof typeof acc]) {
					acc[option] += 1;
				} else {
					acc[option] = 1;
				}
			});
			return acc;
		}, {});

		return Object.entries(responseCounts).map(([name, value]) => ({ name, value }));
	};

	const COLORS = selectedPollDetails[0].options.map(
		(_option, index) => `hsl(${(index * 360) / selectedPollDetails[0].options.length}, 100%, 50%)`
	);

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
										<PieChart width={800} height={400}>
											<Pie
												data={getOptionResponses(selectedPollDetails)}
												outerRadius={150}
												fill='#8884d8'
												paddingAngle={0}
												dataKey='value'
												label
											>
												{getOptionResponses(selectedPollDetails).map((_entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
										</PieChart>
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
												<Th>Response</Th>
											</Tr>
										</Thead>
										<Tbody>
											{selectedPollDetails?.map((poll, index) => (
												<Tr key={index}>
													<Td>{index + 1}</Td>
													<Td>{poll.voter_name}</Td>
													<Td>
														{poll.selected_option.map((option) => (
															<Box as={'span'} mr={'0.5rem'}>
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
					<Button colorScheme='green' mr={3} onClick={onClose}>
						Close
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default PollResponseDialog;
