import { Checkbox, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useTheme } from '@emotion/react';
import { useDispatch, useSelector } from 'react-redux';
import useFilteredList from '../../../../hooks/useFilteredList';
import { StoreNames, StoreState } from '../../../../store';
import {
	addSelectedGroups,
	removeSelectedGroups,
} from '../../../../store/reducers/MergeGroupReducer';

export default function WhatsappGroupTab() {
	const theme = useTheme();

	const dispatch = useDispatch();
	const { groups: list } = useSelector((state: StoreState) => state[StoreNames.USER]);
	const { selectedGroups } = useSelector((state: StoreState) => state[StoreNames.MERGE_GROUP]);

	let filtered = list.filter((g) => !g.isMergedGroup);
	filtered = useFilteredList(filtered, { name: 1 });

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
							<Th color={theme === 'dark' ? 'whitesmoke' : 'gray'} width={'5%'}>
								Participants
							</Th>
						</Tr>
					</Thead>
					<Tbody>
						{filtered.map((group, index) => {
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
									<Td isNumeric>{group.participants}</Td>
								</Tr>
							);
						})}
					</Tbody>
				</Table>
			</TableContainer>
		</>
	);
}
