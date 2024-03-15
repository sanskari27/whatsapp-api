import { CopyIcon, EditIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Center,
	Flex,
	HStack,
	Heading,
	Icon,
	IconButton,
	Popover,
	PopoverArrow,
	PopoverBody,
	PopoverCloseButton,
	PopoverContent,
	PopoverHeader,
	PopoverTrigger,
	Text,
	VStack,
} from '@chakra-ui/react';
import { useMemo, useRef } from 'react';
import { FaLink } from 'react-icons/fa';
import { MdDelete, MdOutlineQrCodeScanner } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useOutlet } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import useDebounce from '../../../../hooks/useDebounce';
import ShortenerService from '../../../../services/shortener.service';
import { StoreNames, StoreState } from '../../../../store';
import { setSearchText } from '../../../../store/reducers/ContactCardReducers';
import { removeShortenLink } from '../../../../store/reducers/LinkShortnerReducers';
import Each from '../../../../utils/Each';
import { filterList } from '../../../../utils/listUtils';
import ConfirmationDialog, {
	ConfirmationDialogHandle,
} from '../../../components/confirmation-alert';
import QRImage from '../../../components/qr-image/QRImage';
import SearchBar from '../../../components/searchbar';

const ShortLinks = () => {
	const dispatch = useDispatch();
	const outlet = useOutlet();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const {
		list,
		ui: { searchText },
	} = useSelector((state: StoreState) => state[StoreNames.LINK]);

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(list, _searchText, { title: 1 });
	}, [_searchText, list]);

	const deleteLink = (id: string) => {
		ShortenerService.deleteLink(id).then(() => {
			dispatch(removeShortenLink(id));
		});
	};

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>
				<Flex width={'98%'} justifyContent={'space-between'} alignItems={'flex-end'}>
					Short Links
					<Link to={NAVIGATION.MEDIA + NAVIGATION.SHORT_LINKS + '/new'}>
						<Button variant='outline' size={'sm'} colorScheme='green' leftIcon={<FaLink />}>
							Create Short Link
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
							render={(link) => (
								<Box width={'full'} borderBottom={'1px gray dashed'} py={'1rem'}>
									<Flex alignItems={'center'}>
										<Box flexGrow={1}>
											<Text fontWeight='medium' className='whitespace-break-spaces'>
												{link.title}
											</Text>
											<Text textColor={Colors.ACCENT_DARK}>Short Link: {link.shorten_link}</Text>
											<Text textColor={Colors.ACCENT_DARK}>
												Link:{' '}
												{link.link.length > 80 ? link.link.substring(0, 80) + '...' : link.link}
											</Text>
										</Box>
										<HStack alignItems={'end'}>
											<ShowQRButton base64={link.base64 ?? ''} />

											<IconButton
												aria-label='Delete'
												icon={<CopyIcon />}
												size={'sm'}
												onClick={() => navigator.clipboard.writeText(link.shorten_link)}
											/>
											<Link to={NAVIGATION.MEDIA + NAVIGATION.SHORT_LINKS + `/${link.id}`}>
												<IconButton aria-label='Edit' size={'sm'} icon={<EditIcon />} />
											</Link>
											<IconButton
												aria-label='Delete'
												size={'sm'}
												icon={<Icon as={MdDelete} color={'red.500'} />}
												onClick={() => confirmationDialogRef.current?.open(link.id)}
											/>
										</HStack>
									</Flex>
								</Box>
							)}
						/>
					</VStack>
				}
			</Box>
			<ConfirmationDialog type={'Link'} ref={confirmationDialogRef} onConfirm={deleteLink} />
			{outlet}
		</Flex>
	);
};

function ShowQRButton({ base64 }: { base64: string }) {
	return (
		<Popover isLazy placement='left' closeOnBlur={true} returnFocusOnClose={false}>
			<PopoverTrigger>
				<IconButton
					size={'sm'}
					fontSize={'1rem'}
					aria-label='qr-code'
					icon={<MdOutlineQrCodeScanner />}
				/>
			</PopoverTrigger>
			<PopoverContent width={'300px'}>
				<PopoverHeader fontWeight='semibold' textAlign={'center'}>
					Scan This QR Code
				</PopoverHeader>
				<PopoverArrow />
				<PopoverCloseButton />
				<PopoverBody>
					<Center height={'280px'} width={'280px'}>
						<QRImage base64={base64} />
					</Center>
				</PopoverBody>
			</PopoverContent>
		</Popover>
	);
}

export default ShortLinks;
