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

	const [groups, setGroups] = useState<
		{
			id: string;
			name: string;
			isMergedGroup: boolean;
		}[]
	>([]);

	const { editSelectedGroup } = useSelector((store: StoreState) => store[StoreNames.MERGE_GROUP]);

	const handleMergeGroup = () => {
		if (editSelectedGroup.name === '') {
			return;
		}
		if (editSelectedGroup.groups.length === 0) {
			return;
		}

		if (editSelectedGroup.id) {
			GroupService.editMergedGroup(
				editSelectedGroup.id,
				editSelectedGroup.name,
				editSelectedGroup.groups
			).then((response) => {
				if (!response) {
					return;
				}
				dispatch(updateMergeGroupsList(response));
				onClose();
			});
		} else {
			GroupService.mergeGroups(editSelectedGroup.name, editSelectedGroup.groups).then(
				(response) => {
					if (!response) {
						return;
					}
					dispatch(
						addMergedGroup({
							id: response.id,
							name: response.name,
							groups: response.groups,
						})
					);
					onClose();
				}
			);
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

	useEffect(() => {
		GroupService.listGroups().then((response) => {
			setGroups(response);
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
							value={editSelectedGroup.name}
							onChange={(e) => dispatch(setName(e.target.value))}
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
