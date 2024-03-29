import { SearchIcon } from '@chakra-ui/icons';
import {
	Button,
	Checkbox,
	Flex,
	FormControl,
	FormLabel,
	Icon,
	IconButton,
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
	Textarea,
	Th,
	Thead,
	Tr,
	useBoolean,
	useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { BiRefresh } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import GroupService from '../../../../services/group.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addMergedGroup,
	addSelectedGroup,
	clearEditMergeGroup,
	removeSelectedGroup,
	setGroupReplySaved,
	setGroupReplyUnsaved,
	setName,
	setPrivateReplySaved,
	setPrivateReplyUnsaved,
	updateMergeGroupsList,
} from '../../../../store/reducers/MergeGroupReducer';
import { setGroups } from '../../../../store/reducers/UserDetailsReducers';

type GroupMergeProps = {
	onClose: () => void;
	isOpen: boolean;
};

const GroupMerge = ({ onClose, isOpen }: GroupMergeProps) => {
	const dispatch = useDispatch();
	const toast = useToast();
	const [dataRefreshing, groupsLoading] = useBoolean();

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
		const { id, name, groups, group_reply, private_reply } = editSelectedGroup;

		const promise = id
			? GroupService.editMergedGroup(id, name, groups, { group_reply, private_reply })
			: GroupService.mergeGroups(name, groups, { group_reply, private_reply });
		toast.promise(promise, {
			success: (data) => {
				const acton = id ? updateMergeGroupsList(data) : addMergedGroup(data);
				dispatch(acton);
				onClose();
				return {
					title: 'Data saved successfully',
				};
			},
			error: {
				title: 'Failed to save data',
			},
			loading: { title: 'Saving Data', description: 'Please wait' },
		});
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

	const handleRefresh = async () => {
		groupsLoading.on();
		const groups = await GroupService.refreshGroups();
		dispatch(setGroups(groups));
		groupsLoading.off();
	};

	const filtered = groups.filter((group) =>
		group.name?.toLowerCase().startsWith(searchText.toLowerCase())
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
					<Text fontSize={'large'}>Reply Settings</Text>
					<FormControl marginTop={'1rem'}>
						<FormLabel>Saved In-Chat Reply</FormLabel>
						<Textarea
							width={'full'}
							minHeight={'80px'}
							size={'sm'}
							rounded={'md'}
							placeholder={'eg. Hello there!'}
							border={'none'}
							className='text-black !bg-[#ECECEC] '
							_placeholder={{
								opacity: 0.4,
								color: 'inherit',
							}}
							_focus={{ border: 'none', outline: 'none' }}
							value={editSelectedGroup.group_reply.saved ?? ''}
							onChange={(e) => dispatch(setGroupReplySaved(e.target.value))}
						/>
					</FormControl>
					<FormControl marginTop={'0.5rem'}>
						<FormLabel>Unsaved In-Chat Reply</FormLabel>
						<Textarea
							width={'full'}
							minHeight={'80px'}
							size={'sm'}
							rounded={'md'}
							placeholder={'eg. Hello there!'}
							border={'none'}
							className='text-black !bg-[#ECECEC] '
							_placeholder={{
								opacity: 0.4,
								color: 'inherit',
							}}
							_focus={{ border: 'none', outline: 'none' }}
							value={editSelectedGroup.group_reply.unsaved ?? ''}
							onChange={(e) => dispatch(setGroupReplyUnsaved(e.target.value))}
						/>
					</FormControl>
					<FormControl marginTop={'0.5rem'}>
						<FormLabel>Saved Private Reply</FormLabel>
						<Textarea
							width={'full'}
							minHeight={'80px'}
							size={'sm'}
							rounded={'md'}
							placeholder={'eg. Hello there!'}
							border={'none'}
							className='text-black !bg-[#ECECEC] '
							_placeholder={{
								opacity: 0.4,
								color: 'inherit',
							}}
							_focus={{ border: 'none', outline: 'none' }}
							value={editSelectedGroup.private_reply.saved ?? ''}
							onChange={(e) => dispatch(setPrivateReplySaved(e.target.value))}
						/>
					</FormControl>
					<FormControl marginTop={'0.5rem'}>
						<FormLabel>Unsaved Private Reply</FormLabel>
						<Textarea
							width={'full'}
							minHeight={'80px'}
							size={'sm'}
							rounded={'md'}
							placeholder={'eg. Hello there!'}
							border={'none'}
							className='text-black !bg-[#ECECEC] '
							_placeholder={{
								opacity: 0.4,
								color: 'inherit',
							}}
							_focus={{ border: 'none', outline: 'none' }}
							value={editSelectedGroup.private_reply.unsaved ?? ''}
							onChange={(e) => dispatch(setPrivateReplyUnsaved(e.target.value))}
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
					<Flex width={'full'} justifyContent={'space-between'} alignItems={'center'}>
						<IconButton
							aria-label='delete'
							icon={<Icon as={BiRefresh} height={6} width={6} />}
							colorScheme={'blue'}
							size={'sm'}
							isLoading={dataRefreshing}
							onClick={handleRefresh}
						/>
						<Flex>
							<Button colorScheme='red' mr={3} onClick={handleClose}>
								Cancel
							</Button>
							<Button colorScheme='green' onClick={handleMergeGroup}>
								{editSelectedGroup.id ? 'Save' : 'Merge'}
							</Button>
						</Flex>
					</Flex>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
};

export default GroupMerge;
