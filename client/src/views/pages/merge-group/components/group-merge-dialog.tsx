import { SearchIcon } from '@chakra-ui/icons';
import {
	Box,
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
	Select,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Textarea,
	Th,
	Thead,
	Tr,
	VStack,
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
	setGroupReplySavedAttachments,
	setGroupReplySavedPolls,
	setGroupReplySavedSharedContactCards,
	setGroupReplySavedText,
	setGroupReplyUnsavedAttachments,
	setGroupReplyUnsavedPolls,
	setGroupReplyUnsavedSharedContactCards,
	setGroupReplyUnsavedText,
	setMaxDelay,
	setMinDelay,
	setName,
	setPrivateReplySavedAttachments,
	setPrivateReplySavedPolls,
	setPrivateReplySavedSharedContactCards,
	setPrivateReplySavedText,
	setPrivateReplyUnsavedAttachments,
	setPrivateReplyUnsavedPolls,
	setPrivateReplyUnsavedSharedContactCards,
	setPrivateReplyUnsavedText,
	setRestrictedNumbers,
	toggleRandomString,
	toggleReplyBusinessOnly,
	updateMergeGroupsList,
} from '../../../../store/reducers/MergeGroupReducer';
import { setGroups } from '../../../../store/reducers/UserDetailsReducers';
import AddOns from '../../../components/add-ons';

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
	const { list: csvList } = useSelector((store: StoreState) => store[StoreNames.CSV]);

	const handleMergeGroup = () => {
		if (editSelectedGroup.name === '') {
			return;
		}
		if (editSelectedGroup.groups.length === 0) {
			return;
		}
		const { id, name, groups } = editSelectedGroup;

		const _editSelectedGroup = {
			...editSelectedGroup,
			group_name: name,
			group_ids: groups,
		};

		const promise = id
			? GroupService.editMergedGroup(id, _editSelectedGroup)
			: GroupService.mergeGroups(_editSelectedGroup);
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
		<Modal isOpen={isOpen} onClose={onClose} size={'5xl'} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Merge Group</ModalHeader>
				<ModalBody>
					<VStack alignItems={'stretch'} gap={'0.5rem'}>
						<FormControl>
							<FormLabel>Group Name</FormLabel>
							<Input
								placeholder='Enter Name'
								value={editSelectedGroup.name}
								onChange={(e) => dispatch(setName(e.target.value))}
							/>
						</FormControl>
						<Text fontSize={'large'}>Reply Settings</Text>
						<Box flex={1}>
							<Flex gap={4}>
								<DelayInput
									placeholder='Min Delay (in sec)'
									value={editSelectedGroup.min_delay}
									onChange={(num) => dispatch(setMinDelay(num))}
								/>
								<DelayInput
									placeholder='Max Delay (in sec)'
									value={editSelectedGroup.max_delay}
									onChange={(num) => dispatch(setMaxDelay(num))}
								/>
								<VStack flex={1} justifyContent={'flex-end'} alignItems={'flex-start'} gap={'0'}>
									<Checkbox
										colorScheme='green'
										size='sm'
										isChecked={editSelectedGroup.reply_business_only}
										onChange={() => dispatch(toggleReplyBusinessOnly())}
									>
										Reply Businesses Only
									</Checkbox>
									<Checkbox
										colorScheme='green'
										size='sm'
										isChecked={editSelectedGroup.random_string}
										onChange={() => dispatch(toggleRandomString())}
									>
										Append Random Text
									</Checkbox>
								</VStack>
							</Flex>
						</Box>
						<Box>
							<Text>Restricted Numbers</Text>
							<Flex direction={'column'} gap={2}>
								<Select
									className='!bg-[#ECECEC]  rounded-md w-full text-black'
									border={'none'}
									value={editSelectedGroup.restricted_numbers}
									onChange={(e) => dispatch(setRestrictedNumbers(e.target.value))}
								>
									<option value={''} className='text-black   !bg-[#ECECEC]  '>
										Select one!
									</option>
									{csvList.map(({ id, name }) => (
										<option
											className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
											value={id}
											key={id}
										>
											{name}
										</option>
									))}
								</Select>
							</Flex>
						</Box>

						<FormControl>
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
								value={editSelectedGroup.group_reply_saved.text ?? ''}
								onChange={(e) => dispatch(setGroupReplySavedText(e.target.value))}
							/>
						</FormControl>
						<Box>
							<AddOns
								attachments={editSelectedGroup.group_reply_saved.attachments}
								shared_contact_cards={editSelectedGroup.group_reply_saved.shared_contact_cards}
								polls={editSelectedGroup.group_reply_saved.polls}
								onAttachmentsSelected={(ids) => dispatch(setGroupReplySavedAttachments(ids))}
								onContactsSelected={(ids) => dispatch(setGroupReplySavedSharedContactCards(ids))}
								onPollsSelected={(ids) => dispatch(setGroupReplySavedPolls(ids))}
							/>
						</Box>
						<FormControl>
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
								value={editSelectedGroup.group_reply_unsaved.text ?? ''}
								onChange={(e) => dispatch(setGroupReplyUnsavedText(e.target.value))}
							/>
						</FormControl>
						<Box>
							<AddOns
								attachments={editSelectedGroup.group_reply_unsaved.attachments}
								shared_contact_cards={editSelectedGroup.group_reply_unsaved.shared_contact_cards}
								polls={editSelectedGroup.group_reply_unsaved.polls}
								onAttachmentsSelected={(ids) => dispatch(setGroupReplyUnsavedAttachments(ids))}
								onContactsSelected={(ids) => dispatch(setGroupReplyUnsavedSharedContactCards(ids))}
								onPollsSelected={(ids) => dispatch(setGroupReplyUnsavedPolls(ids))}
							/>
						</Box>
						<FormControl>
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
								value={editSelectedGroup.private_reply_saved.text ?? ''}
								onChange={(e) => dispatch(setPrivateReplySavedText(e.target.value))}
							/>
						</FormControl>
						<Box>
							<AddOns
								attachments={editSelectedGroup.private_reply_saved.attachments}
								shared_contact_cards={editSelectedGroup.private_reply_saved.shared_contact_cards}
								polls={editSelectedGroup.private_reply_saved.polls}
								onAttachmentsSelected={(ids) => dispatch(setPrivateReplySavedAttachments(ids))}
								onContactsSelected={(ids) => dispatch(setPrivateReplySavedSharedContactCards(ids))}
								onPollsSelected={(ids) => dispatch(setPrivateReplySavedPolls(ids))}
							/>
						</Box>
						<FormControl>
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
								value={editSelectedGroup.private_reply_unsaved.text ?? ''}
								onChange={(e) => dispatch(setPrivateReplyUnsavedText(e.target.value))}
							/>
						</FormControl>
						<Box>
							<AddOns
								attachments={editSelectedGroup.private_reply_unsaved.attachments}
								shared_contact_cards={editSelectedGroup.private_reply_unsaved.shared_contact_cards}
								polls={editSelectedGroup.private_reply_unsaved.polls}
								onAttachmentsSelected={(ids) => dispatch(setPrivateReplyUnsavedAttachments(ids))}
								onContactsSelected={(ids) =>
									dispatch(setPrivateReplyUnsavedSharedContactCards(ids))
								}
								onPollsSelected={(ids) => dispatch(setPrivateReplyUnsavedPolls(ids))}
							/>
						</Box>
						<TableContainer>
							<Table>
								<Thead>
									<Tr>
										<Th width={'5%'}>Select</Th>
										<Th>
											<Flex
												alignItems={'center'}
												justifyContent={'space-between'}
												direction={'row'}
											>
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
					</VStack>
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

export function NumberInput({
	value,
	onChangeText,
}: {
	value: number;
	onChangeText: (value: number) => void;
}) {
	return (
		<Input
			type='number'
			placeholder='10'
			size={'md'}
			rounded={'md'}
			border={'none'}
			className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
			_focus={{
				border: 'none',
				outline: 'none',
			}}
			value={value}
			onChange={(e) => onChangeText(Number(e.target.value))}
		/>
	);
}

export function SelectElement({
	options,
	value,
	onChangeText,
	size = 'md',
}: {
	options: { title: string; value: string }[];
	value: string;
	onChangeText: (text: string) => void;
	size?: string;
}) {
	return (
		<Select
			className={'!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full  text-black dark:text-white'}
			border={'none'}
			value={value}
			rounded={'md'}
			size={size}
			onChange={(e) => onChangeText(e.target.value)}
		>
			{options.map((option, index) => (
				<option
					key={index}
					className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
					value={option.value}
				>
					{option.title}
				</option>
			))}
		</Select>
	);
}

function DelayInput({
	onChange,
	placeholder,
	value,
	invalid,
}: {
	placeholder: string;
	value: number;
	onChange: (num: number) => void;
	invalid?: boolean;
}) {
	return (
		<FormControl flex={1} isInvalid={invalid}>
			<Text fontSize='sm' className='text-gray-700'>
				{placeholder}
			</Text>
			<Input
				width={'full'}
				placeholder='5'
				rounded={'md'}
				border={'none'}
				className='text-black  !bg-[#ECECEC] '
				_focus={{
					border: 'none',
					outline: 'none',
				}}
				type='number'
				min={1}
				value={value.toString()}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		</FormControl>
	);
}

export default GroupMerge;
