import { EditIcon } from '@chakra-ui/icons';
import {
	Checkbox,
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
import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import useFilteredList from '../../../../hooks/useFilteredList';
import { StoreNames, StoreState } from '../../../../store';
import {
	addSelectedGroups,
	editSelectedGroup,
	removeSelectedGroups,
	setGroupReplySaved,
	setGroupReplyUnsaved,
	setPrivateReplySaved,
	setPrivateReplyUnsaved,
} from '../../../../store/reducers/MergeGroupReducer';
import GroupMerge from './group-merge-dialog';

export default function MergedGroupTab() {
	const { isOpen, onOpen, onClose } = useDisclosure();
	const theme = useTheme();

	const dispatch = useDispatch();
	const {
		list,
		selectedGroups,
		uiDetails: { isFetching },
	} = useSelector((state: StoreState) => state[StoreNames.MERGE_GROUP]);

	const filtered = useFilteredList(list, { name: 1 });

	return (
		<>
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
														dispatch(addSelectedGroups(group.id));
													} else {
														dispatch(removeSelectedGroups(group.id));
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
													dispatch(setPrivateReplyUnsaved(group.private_reply.unsaved));
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
		</>
	);
}

function LineSkeleton() {
	return <SkeletonText mt='4' noOfLines={1} spacing='4' skeletonHeight='4' rounded={'md'} />;
}
