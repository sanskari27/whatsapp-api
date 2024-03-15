import { EditIcon } from '@chakra-ui/icons';
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
	StackDivider,
	Text,
	VStack,
} from '@chakra-ui/react';
import { useMemo, useRef } from 'react';
import { MdDelete, MdOutlineQrCodeScanner } from 'react-icons/md';
import { RiContactsBook2Line } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useOutlet } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import useDebounce from '../../../../hooks/useDebounce';
import ContactCardService from '../../../../services/contact-card.service';
import { StoreNames, StoreState } from '../../../../store';
import { deleteContactCard, setSearchText } from '../../../../store/reducers/ContactCardReducers';
import Each from '../../../../utils/Each';
import { filterList } from '../../../../utils/listUtils';
import ConfirmationDialog, {
	ConfirmationDialogHandle,
} from '../../../components/confirmation-alert';
import QRImage from '../../../components/qr-image/QRImage';
import SearchBar from '../../../components/searchbar';

const Contacts = () => {
	const dispatch = useDispatch();
	const outlet = useOutlet();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const {
		list,
		uiDetails: { searchText },
	} = useSelector((state: StoreState) => state[StoreNames.CONTACT_CARD]);

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(list, _searchText, {
			first_name: 1,
			last_name: 1,
			contact_phone: 1,
			contact_work: 1,
		});
	}, [_searchText, list]);

	function deleteContact(id: string) {
		ContactCardService.DeleteContacts(id).then(() => {
			dispatch(deleteContactCard(id));
		});
	}

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>
				<Flex width={'98%'} justifyContent={'space-between'} alignItems={'flex-end'}>
					Contact Cards
					<Link to={NAVIGATION.MEDIA + NAVIGATION.CONTACT + '/new'}>
						<Button
							variant='outline'
							size={'sm'}
							colorScheme='green'
							leftIcon={<RiContactsBook2Line />}
						>
							Add Contact
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
							render={(contact) => (
								<Box width={'full'} borderBottom={'1px gray dashed'} py={'1rem'}>
									<Flex alignItems={'center'}>
										<Box flexGrow={1}>
											<Text fontWeight='medium' className='whitespace-break-spaces'>
												{contact.first_name}
												{contact.middle_name}
												{contact.last_name}
											</Text>
											<HStack
												divider={<StackDivider borderColor={Colors.ACCENT_DARK} />}
												gap={'0.5rem'}
											>
												{contact.contact_phone ? (
													<Text textColor={Colors.ACCENT_DARK}>
														Contact Phone: +{contact.contact_phone.country_code}{' '}
														{contact.contact_phone.number}
													</Text>
												) : null}
												{contact.contact_work ? (
													<Text textColor={Colors.ACCENT_DARK}>
														Contact Phone: +{contact.contact_work.country_code}{' '}
														{contact.contact_work.number}
													</Text>
												) : null}
											</HStack>
											<HStack
												divider={<StackDivider borderColor={Colors.ACCENT_DARK} />}
												gap={'0.5rem'}
											>
												{contact.title && (
													<Text textColor={Colors.ACCENT_DARK}>Title: {contact.title}</Text>
												)}
												{contact.organization && (
													<Text textColor={Colors.ACCENT_DARK}>
														Organization: {contact.organization}
													</Text>
												)}
											</HStack>
											<HStack
												divider={<StackDivider borderColor={Colors.ACCENT_DARK} />}
												gap={'1rem'}
											>
												{contact.city && (
													<Text textColor={Colors.ACCENT_DARK}>City: {contact.city}</Text>
												)}
												{contact.state && (
													<Text textColor={Colors.ACCENT_DARK}>State: {contact.state}</Text>
												)}
												{contact.country && (
													<Text textColor={Colors.ACCENT_DARK}>Country: {contact.country}</Text>
												)}
												{contact.pincode && (
													<Text textColor={Colors.ACCENT_DARK}>Pincode: {contact.pincode}</Text>
												)}
											</HStack>
										</Box>
										<HStack alignItems={'end'}>
											<ShowQRButton base64={contact.base64 ?? ''} />

											<Link to={NAVIGATION.MEDIA + NAVIGATION.CONTACT + `/${contact.id}`}>
												<IconButton size={'sm'} aria-label='Exit' icon={<EditIcon />} />
											</Link>
											<IconButton
												size={'sm'}
												aria-label='Delete'
												icon={<Icon as={MdDelete} color={'red.500'} />}
												onClick={() => confirmationDialogRef.current?.open(contact.id)}
											/>
										</HStack>
									</Flex>
								</Box>
							)}
						/>
					</VStack>
				}
			</Box>
			<ConfirmationDialog type={'Contact'} ref={confirmationDialogRef} onConfirm={deleteContact} />
			{outlet}
		</Flex>
	);
};

function ShowQRButton({ base64 }: { base64: string }) {
	return (
		<Popover isLazy placement='left' closeOnBlur={true} returnFocusOnClose={false}>
			<PopoverTrigger>
				<IconButton size={'sm'} aria-label='qr-code' icon={<MdOutlineQrCodeScanner />} />
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

export default Contacts;
