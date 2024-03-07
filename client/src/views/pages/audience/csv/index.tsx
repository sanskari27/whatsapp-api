import { DownloadIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Text,
	VStack,
} from '@chakra-ui/react';
import { useMemo, useRef } from 'react';
import { MdDelete } from 'react-icons/md';
import { PiFileCsvBold } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useOutlet } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import useDebounce from '../../../../hooks/useDebounce';
import UploadsService from '../../../../services/uploads.service';
import { StoreNames, StoreState } from '../../../../store';
import { deleteSelectedCSVFile, setSearchText } from '../../../../store/reducers/CSVFileReducers';
import Each from '../../../../utils/Each';
import { filterList } from '../../../../utils/listUtils';
import ConfirmationDialog, {
	ConfirmationDialogHandle,
} from '../../../components/confirmation-alert';
import SearchBar from '../../../components/searchbar';

export default function CSV() {
	const dispatch = useDispatch();
	const outlet = useOutlet();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const {
		list,
		uiDetails: { searchText },
	} = useSelector((state: StoreState) => state[StoreNames.CSV]);

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(list, _searchText, {
			name: 1,
		});
	}, [list, _searchText]);

	const deleteCSVFile = (id: string) => {
		UploadsService.deleteCSV(id).then((res) => {
			if (!res) {
				return;
			}
			dispatch(deleteSelectedCSVFile(id));
		});
	};
	const downloadCSV = (id: string) => {
		UploadsService.downloadCSV(id);
	};

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>
				<Flex width={'98%'} justifyContent={'space-between'} alignItems={'flex-end'}>
					CSV
					<Link to={NAVIGATION.AUDIENCE + NAVIGATION.CSV + '/upload-csv'}>
						<Button variant='outline' size={'sm'} colorScheme='green' leftIcon={<PiFileCsvBold />}>
							Upload CSV
						</Button>
					</Link>
				</Flex>
			</Heading>

			<Box marginTop={'1rem'} width={'98%'} pb={'5rem'}>
				<SearchBar text={searchText} onTextChange={(text) => dispatch(setSearchText(text))} />
				<Text textAlign={'right'} color={Colors.PRIMARY_DARK}>
					{filtered.length} records found.
				</Text>
				{
					<VStack alignItems={'flex-start'}>
						<Each
							items={filtered}
							render={(file) => (
								<Box width={'full'} borderBottom={'1px gray dashed'} py={'1rem'}>
									<Flex alignItems={'center'}>
										<Box flexGrow={1}>
											<Text fontWeight='medium' className='whitespace-break-spaces'>
												{file.name}
											</Text>
											<Text
												color={Colors.ACCENT_DARK}
												className='whitespace-break-spaces'
												width='80%'
											>
												{file.headers.join(', ')}
											</Text>
										</Box>
										<HStack alignItems={'end'}>
											<IconButton
												size='sm'
												aria-label='Download'
												icon={<DownloadIcon />}
												onClick={() => downloadCSV(file.id)}
											/>
											<IconButton
												size={'sm'}
												aria-label='Delete'
												icon={<Icon as={MdDelete} color={'red.500'} />}
												onClick={() => confirmationDialogRef.current?.open(file.id)}
											/>
										</HStack>
									</Flex>
								</Box>
							)}
						/>
					</VStack>
				}
			</Box>
			<ConfirmationDialog type={'CSV'} ref={confirmationDialogRef} onConfirm={deleteCSVFile} />
			{outlet}
		</Flex>
	);
}
