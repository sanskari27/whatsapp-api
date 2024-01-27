import { SearchIcon } from '@chakra-ui/icons';
import {
	Button,
	Checkbox,
	Flex,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputLeftElement,
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
	Text,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import GroupService from '../../../../services/group.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addMergedGroup,
	addSelectedGroup,
	clearEditMergeGroup,
	removeSelectedGroup,
	setName,
	updateMergeGroupsList,
} from '../../../../store/reducers/MergeGroupReducer';

type GroupMergeProps = {
	onClose: () => void;
	isOpen: boolean;
};

const GroupMerge = ({ onClose, isOpen }: GroupMergeProps) => {
	const dispatch = useDispatch();

	const [searchText, setSearchText] = useState<string>('');

	const { editSelectedGroup } = useSelector((store: StoreState) => store[StoreNames.MERGE_GROUP]);
	const { groups } = useSelector((store: StoreState) => store[StoreNames.USER]);

	const handleMergeGroup = () => {
		if (editSelectedGroup.name === '') {
			return;
		}
		if (editSelectedGroup.groups.length === 0) {
			return;
		}
		const { id, name, groups } = editSelectedGroup;
		if (editSelectedGroup.id) {
			GroupService.editMergedGroup(id, name, groups).then((response) => {
				if (!response) {
					return;
				}
				dispatch(updateMergeGroupsList(response));
				onClose();
			});
		} else {
			GroupService.mergeGroups(name, groups).then((response) => {
				if (!response) {
					return;
				}
				dispatch(addMergedGroup(response));
				onClose();
			});
		}
	};

	const handleSelectGroup = (id: string) => {
		if (editSelectedGroup.groups.includes(id)) {
			dispatch(removeSelectedGroup(id));
		} else {
			dispatch(addSelectedGroup(id));
		}
	};

	const handleClose = () => {
		dispatch(clearEditMergeGroup());
		onClose();
	};

	const filtered = groups.filter((group) =>
		group.name.toLowerCase().startsWith(searchText.toLowerCase())
	);

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'2xl'} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Merge Group</ModalHeader>
				<ModalBody>
					<FormControl>
						<FormLabel>Group Name</FormLabel>
						<Input
							placeholder='Enter Name'
							value={editSelectedGroup.name}
							onChange={(e) => dispatch(setName(e.target.value))}
						/>
					</FormControl>
					<TableContainer>
						<Table>
							<Thead>
								<Tr>
									<Th width={'5%'}>Select</Th>
									<Th>
										<Flex alignItems={'center'} justifyContent={'space-between'} direction={'row'}>
											<Text>Name</Text>
											<InputGroup size='sm' variant={'outline'} width={'250px'}>
												<InputLeftElement pointerEvents='none'>
													<SearchIcon color='gray.300' />
												</InputLeftElement>
												<Input
													placeholder='Search here...'
													value={searchText}
													onChange={(e) => setSearchText(e.target.value)}
													borderRadius={'5px'}
													focusBorderColor='gray.300'
												/>
											</InputGroup>
										</Flex>
									</Th>
								</Tr>
							</Thead>
							<Tbody>
								{filtered.map((group, index) => {
									if (!group.isMergedGroup)
										return (
											<Tr key={index}>
												<Td>
													<Checkbox
														isChecked={editSelectedGroup.groups.includes(group.id)}
														onChange={() => handleSelectGroup(group.id)}
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
					<Button colorScheme='red' mr={3} onClick={handleClose}>
						Cancel
					</Button>
					<Button colorScheme='green' onClick={handleMergeGroup}>
						{editSelectedGroup.id ? 'Update' : 'Merge'}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default GroupMerge;
