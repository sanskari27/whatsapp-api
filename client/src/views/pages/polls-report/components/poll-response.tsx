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
import { StoreNames, StoreState } from '../../../../store';

import { Pie } from 'react-chartjs-2';

type PollResponseDialogProps = {
	isOpen: boolean;
	onClose: () => void;
};

const PollResponseDialog = ({ onClose, isOpen }: PollResponseDialogProps) => {
	const { selectedPollDetails } = useSelector((store: StoreState) => store[StoreNames.POLL]);

	if (!selectedPollDetails) return null;

	const uniqueResponses = selectedPollDetails.map((poll) => poll.selected_option).flat();

	const responseCount = uniqueResponses.reduce((acc, curr) => {
		if (acc[curr]) {
			acc[curr] += 1;
		} else {
			acc[curr] = 1;
		}
		return acc;
	}, {} as { [key: string]: number });

	const data = {
		labels: Object.keys(responseCount),
		datasets: [
			{
				label: '# of Votes',
				data: Object.values(responseCount),
				backgroundColor: selectedPollDetails.map(() => {
					const r = Math.floor(Math.random() * 255);
					const g = Math.floor(Math.random() * 255);
					const b = Math.floor(Math.random() * 255);
					return `rgb(${r}, ${g}, ${b})`;
				}),
				borderWidth: 1,
			},
		],
		hoverOffset: 4,
	};

	console.log(responseCount);
	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'5xl'} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Modal Title</ModalHeader>
				<ModalBody>
					<Tabs variant='unstyled'>
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
								{Object.keys(responseCount).length > 0 ? (
									<Box mt={'2rem'} width={'30%'}>
										<Pie data={data} />
									</Box>
								) : (
									<Box mt={'2rem'}>No responses yet</Box>
								)}
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
												<Tr>
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
					<Button colorScheme='blue' mr={3} onClick={onClose}>
						Close
					</Button>
					<Button variant='ghost'>Secondary Action</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default PollResponseDialog;
