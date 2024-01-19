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
import { MdDelete, MdGroupAdd, MdGroups3 } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
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
	setIsFetching,
	setMergedGroupList,
} from '../../../store/reducers/MergeGroupReducer';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
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
					<Button
						leftIcon={<MdDelete />}
						colorScheme={'red'}
						size={'sm'}
						isLoading={isDeleting}
						isDisabled={selectedGroups.length === 0}
						onClick={() => confirmationDialogRef.current?.open()}
					>
						Delete Groups
					</Button>
					<Button leftIcon={<MdGroupAdd />} size={'sm'} colorScheme='blue' onClick={onOpen}>
						Merge Group
					</Button>
				</HStack>
			),
		});
		return () => {
			popFromNavbar();
		};
	}, [onOpen, selectedGroups.length, isDeleting]);

	useEffect(() => {
		dispatch(setIsFetching(true));
		GroupService.mergedGroups()
			.then((groups) => dispatch(setMergedGroupList(groups)))
			.finally(() => dispatch(setIsFetching(false)));
	}, [dispatch]);

	return (
		<Box>
			<TableContainer>
				<Table>
					<Thead>
						<Tr>
							<Th width={'5%'}>sl no</Th>
							<Th width={'70%'}>Group Name</Th>
							<Th width={'15%'} isNumeric>
								No of Whatsapp Groups
							</Th>
							<Th>Edit</Th>
						</Tr>
					</Thead>
					<Tbody>
						{isFetching && list.length === 0 ? (
							<Tr
								bg={theme === 'light' ? 'gray.50' : 'gray.700'}
								color={theme === 'dark' ? 'white' : 'black'}
							>
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
							list.map((group, index) => {
								return (
									<Tr key={index} cursor={'pointer'}>
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
