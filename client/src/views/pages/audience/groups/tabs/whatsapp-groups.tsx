import { Box, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Colors } from '../../../../../config/const';
import useDebounce from '../../../../../hooks/useDebounce';
import { StoreNames, StoreState } from '../../../../../store';
import Each from '../../../../../utils/Each';
import { filterList } from '../../../../../utils/listUtils';
import SearchBar from '../../../../components/searchbar';

const WhatsappGroups = () => {
	const [searchText, setSearchText] = useState('');
	const { groups } = useSelector((state: StoreState) => state[StoreNames.USER]);

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(groups, '', {
			customFilter: (item, state) =>
				item.name?.toLowerCase().includes(state.searchText.toLowerCase()),
			customFilterDeps: { searchText: _searchText },
		});
	}, [_searchText, groups]);

	return (
		<>
			<Box pb={'5rem'}>
				<SearchBar text={searchText} onTextChange={setSearchText} />
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
										<Text textColor={'blue.500'}>Participants: {group.participants}</Text>
									</Box>
									<HStack alignItems={'end'}>
										{/* <Link
											to={
												NAVIGATION.AUDIENCE +
												NAVIGATION.GROUP +
												NAVIGATION.MERGE_GROUP +
												`/${group.id}`
											}
										>
											<IconButton
												size={'sm'}
												aria-label='Export'
												icon={<EditIcon color={'blue.500'} />}
											/>
										</Link> */}
									</HStack>
								</Flex>
							</Box>
						)}
					/>
				</VStack>
			</Box>
		</>
	);
};

export default WhatsappGroups;
