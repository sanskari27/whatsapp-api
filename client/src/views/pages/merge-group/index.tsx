import { EditIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Checkbox,
	HStack,
	IconButton,
	SkeletonText,
	Table,
	TableContainer,
	Tbody,
	Td,
	Th,
	Thead,
	Tr,
	useDisclosure,
} from '@chakra-ui/react';

import { useEffect, useRef } from 'react';
import { MdGroupAdd, MdGroups3 } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import useFilteredList from '../../../hooks/useFilteredList';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import GroupService from '../../../services/group.service';
import { StoreNames, StoreState } from '../../../store';
import {
	addSelectedMergedGroups,
	clearEditMergeGroup,
	deleteMergedGroup,
	editSelectedGroup,
	removeSelectedMergedGroups,
	setGroupReplySaved,
	setGroupReplyUnsaved,
	setIsDeleting,
	setPrivateReplySaved,
	setPrivateReplyUnsaved,
} from '../../../store/reducers/MergeGroupReducer';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import { NavbarDeleteElement, NavbarSearchElement } from '../../components/navbar';
import GroupMerge from './components/group-merge-dialog';

const GroupMergePage = () => {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const theme = useTheme();

	const dispatch = useDispatch();
	const {
		list,
		selectedGroups,
		uiDetails: { isFetching, isDeleting },
	} = useSelector((state: StoreState) => state[StoreNames.MERGE_GROUP]);

	const deleteGroup = () => {
		dispatch(setIsDeleting(true));
		selectedGroups.forEach(async (id) => {
			GroupService.deleteMerged(id).then((res) => {
				if (!res) {
					return;
				}
				dispatch(deleteMergedGroup(id));
			});
		});
	};

	useEffect(() => {
		pushToNavbar({
			title: 'Group Merge',
			icon: MdGroups3,
			actions: (
				<HStack>
					<NavbarSearchElement />
					<NavbarDeleteElement
						isDisabled={selectedGroups.length === 0}
						onClick={() => confirmationDialogRef.current?.open('')}
					/>
					<Button
						leftIcon={<MdGroupAdd />}
						size={'sm'}
						colorScheme='blue'
						onClick={() => {
							dispatch(clearEditMergeGroup());
							onOpen();
						}}
					>
						MERGE
					</Button>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [onOpen, selectedGroups.length, isDeleting, dispatch]);

	const filtered = useFilteredList(list, { name: 1 });

	return (
		<Box>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'5%'}>
								sl no
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'75%'}>
								Group Name
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'15%'} isNumeric>
								No of Whatsapp Groups
							</Th>
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'5%'}>
								Edit
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{isFetching && list.length === 0 ? (
							<Tr color={theme === 'dark' ? 'white' : 'black'}>
								<Td>
									<LineSkeleton />
								</Td>

								<Td>
									<LineSkeleton />
								</Td>

								<Td>
									<LineSkeleton />
								</Td>
								<Td>
									<LineSkeleton />
								</Td>
							</Tr>
						) : (
							filtered.map((group, index) => {
								return (
									<Tr key={index} cursor={'pointer'} color={theme === 'dark' ? 'white' : 'black'}>
										<Td>
											<Checkbox
												mr={'1rem'}
												isChecked={selectedGroups.includes(group.id)}
												onChange={(e) => {
													if (e.target.checked) {
														dispatch(addSelectedMergedGroups(group.id));
													} else {
														dispatch(removeSelectedMergedGroups(group.id));
													}
												}}
												colorScheme='green'
											/>
											{index + 1}.
										</Td>
										<Td>{group.name}</Td>
										<Td isNumeric>{group.groups.length}</Td>
										<Td>
											<IconButton
												aria-label='edit merge group'
												icon={<EditIcon />}
												colorScheme='gray'
												onClick={() => {
													dispatch(editSelectedGroup(group.id));
													dispatch(setGroupReplySaved(group.group_reply.saved));
													dispatch(setGroupReplyUnsaved(group.group_reply.unsaved));
													dispatch(setPrivateReplySaved(group.private_reply.saved));
													dispatch(setPrivateReplyUnsaved(group.private_reply.saved));
													onOpen();
												}}
											/>
										</Td>
									</Tr>
								);
							})
						)}
					</Tbody>
				</Table>
			</TableContainer>
			<GroupMerge isOpen={isOpen} onClose={onClose} />
			<ConfirmationDialog
				ref={confirmationDialogRef}
				onConfirm={deleteGroup}
				type={'Merged Groups'}
			/>
		</Box>
	);
};

function LineSkeleton() {
	return <SkeletonText mt='4' noOfLines={1} spacing='4' skeletonHeight='4' rounded={'md'} />;
}

export default GroupMergePage;
