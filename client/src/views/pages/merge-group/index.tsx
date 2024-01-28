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
	deleteMergedGroup,
	editSelectedGroup,
	removeSelectedMergedGroups,
	setIsDeleting,
} from '../../../store/reducers/MergeGroupReducer';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import { NavbarDeleteElement, NavbarSearchElement } from '../../components/navbar';
import GroupMerge from './components/group-merge-dialog';

const GroupAndLabelPage = () => {
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
					<Button leftIcon={<MdGroupAdd />} size={'sm'} colorScheme='blue' onClick={onOpen}>
						MERGE
					</Button>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [onOpen, selectedGroups.length, isDeleting]);

	const filtered = useFilteredList(list, { name: 1 });

	return (
		<Box>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th width={'5%'}>sl no</Th>
							<Th width={'75%'}>Group Name</Th>
							<Th width={'15%'} isNumeric>
								No of Whatsapp Groups
							</Th>
							<Th width={'5%'}>Edit</Th>
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
													onOpen();
													dispatch(editSelectedGroup(group.id));
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

export default GroupAndLabelPage;
