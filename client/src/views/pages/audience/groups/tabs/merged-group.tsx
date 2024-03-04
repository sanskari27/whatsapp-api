import { EditIcon } from '@chakra-ui/icons';
import { Box, Flex, HStack, Icon, IconButton, Text, VStack, useDisclosure } from '@chakra-ui/react';
import { useMemo, useRef } from 'react';
import { MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../../config/const';
import useDebounce from '../../../../../hooks/useDebounce';
import GroupService from '../../../../../services/group.service';
import { StoreNames, StoreState } from '../../../../../store';
import {
	deleteMergedGroup,
	editSelectedGroup,
	setGroupReplySaved,
	setGroupReplyUnsaved,
	setPrivateReplySaved,
	setPrivateReplyUnsaved,
	setSearchText,
} from '../../../../../store/reducers/MergeGroupReducer';
import Each from '../../../../../utils/Each';
import { filterList } from '../../../../../utils/listUtils';
import ConfirmationDialog, {
	ConfirmationDialogHandle,
} from '../../../../components/confirmation-alert';
import SearchBar from '../../../../components/searchbar';
import GroupMerge from '../components/group-merge-dialog';

const MergedGroups = () => {
	const dispatch = useDispatch();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const { isOpen, onOpen, onClose } = useDisclosure();

	const {
		list,
		uiDetails: { searchText },
	} = useSelector((state: StoreState) => state[StoreNames.MERGE_GROUP]);

	const deleteGroup = async (id: string) => {
		GroupService.deleteMerged(id).then((res) => {
			if (!res) {
				return;
			}
			dispatch(deleteMergedGroup(id));
		});
	};
	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(list, '', {
			customFilter: (item, state) =>
				item.name.toLowerCase().includes(state._searchText.toLowerCase()),
			customFilterDeps: { _searchText },
		});
	}, [list, _searchText]);

	return (
		<>
			<Box pb={'5rem'}>
				<SearchBar text={searchText} onTextChange={(text) => dispatch(setSearchText(text))} />
				<Text textAlign={'right'} color={Colors.PRIMARY_DARK}>
					{filtered.length} records found.
				</Text>
				<VStack alignItems={'flex-start'} marginTop={'-1rem'}>
					<Each
						items={filtered}
						render={(group) => (
							<Box width={'full'} borderBottom={'1px gray dashed'} py={'1rem'}>
								<Flex alignItems={'center'}>
									<Box flexGrow={1}>
										<Text fontWeight='medium' className='whitespace-break-spaces'>
											{group.name}
										</Text>
										<Text textColor={'blue.500'}>Groups: {group.groups.length}</Text>
									</Box>
									<HStack alignItems={'end'}>
										<IconButton
											size={'sm'}
											aria-label='Export'
											icon={<EditIcon color={'blue.500'} />}
											onClick={() => {
												dispatch(editSelectedGroup(group.id));
												dispatch(setGroupReplySaved(group.group_reply.saved));
												dispatch(setGroupReplyUnsaved(group.group_reply.unsaved));
												dispatch(setPrivateReplySaved(group.private_reply.saved));
												dispatch(setPrivateReplyUnsaved(group.private_reply.unsaved));
												onOpen();
											}}
										/>
										<IconButton
											size={'sm'}
											aria-label='Delete'
											icon={<Icon as={MdDelete} color={'red.500'} />}
											onClick={() => confirmationDialogRef.current?.open(group.id)}
										/>
									</HStack>
								</Flex>
							</Box>
						)}
					/>
				</VStack>
			</Box>
			<ConfirmationDialog
				type={'Merged Group'}
				ref={confirmationDialogRef}
				onConfirm={deleteGroup}
			/>
			<GroupMerge isOpen={isOpen} onClose={onClose} />
		</>
	);
};

export default MergedGroups;
