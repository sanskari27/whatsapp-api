import {
	Button,
	Checkbox,
	FormControl,
	FormLabel,
	Input,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import GroupService from '../../../../services/group.service';

type GroupMergeProps = {
	onClose: () => void;
	isOpen: boolean;
};

const GroupMerge = ({ onClose, isOpen }: GroupMergeProps) => {
	const [groups, setGroups] = useState<
		{
			id: string;
			name: string;
			isMergedGroup: boolean;
		}[]
	>([]);

	const [mergeGroupDetails, setMergeGroupDetails] = useState<{
		name: string;
		groups: string[];
	}>({
		name: '',
		groups: [],
	});

	const setSelectedGroups = (id: string) => {
		setMergeGroupDetails((prev) => {
			return { ...prev, groups: [...prev.groups, id] };
		});
	};

	const handleMergeGroup = () => {
		if (mergeGroupDetails.name === '') {
			return;
		}
		if (mergeGroupDetails.groups.length === 0) {
			return;
		}

		GroupService.mergeGroups(mergeGroupDetails.name, mergeGroupDetails.groups).then((response) => {
			if (!response) {
				return;
			}
			onClose();
		});
	};

	useEffect(() => {
		GroupService.listGroups().then((response) => {
			setGroups(response);
		});
		setMergeGroupDetails({
			name: '',
			groups: [],
		});
	}, []);

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'2xl'} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Merge Group</ModalHeader>
				<ModalBody>
					<FormControl>
						<FormLabel>Enter Name</FormLabel>
						<Input
							placeholder='Enter Name'
							value={mergeGroupDetails.name}
							onChange={(e) =>
								setMergeGroupDetails((prev) => {
									return { ...prev, name: e.target.value };
								})
							}
						/>
					</FormControl>
					<TableContainer>
						<Table>
							<Thead>
								<Tr>
									<Th width={'5%'}>Select</Th>
									<Th>Name</Th>
								</Tr>
							</Thead>
							<Tbody>
								{groups.map((group, index) => {
									if (!group.isMergedGroup)
										return (
											<Tr key={index}>
												<Td>
													<Checkbox
														checked={mergeGroupDetails.groups.includes(group.id)}
														onChange={() => setSelectedGroups(group.id)}
														mr={'0.5rem'}
													/>
													{index + 1}
												</Td>
												<Td>{group.name}</Td>
											</Tr>
										);
								})}
							</Tbody>
						</Table>
					</TableContainer>
				</ModalBody>

				<ModalFooter>
					<Button colorScheme='red' mr={3} onClick={onClose}>
						Cancel
					</Button>
					<Button colorScheme='green' onClick={handleMergeGroup}>
						Merge Group
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default GroupMerge;
