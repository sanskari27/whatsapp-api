import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Checkbox,
	HStack,
	Icon,
	IconButton,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tr,
} from '@chakra-ui/react';
import React, { useRef } from 'react';
import { MdContactPage, MdContacts } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import ContactCardService from '../../../services/contant-card.service';
import { StoreNames, StoreState } from '../../../store';
import {
	deleteContactCard,
	deletingContactCard,
	findContactById,
	updatingContactCard,
} from '../../../store/reducers/ContactCardReducers';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import QrImage from '../../components/qr-image';
import ContactInputDialog, { ContactInputDialogHandle } from './components/contact-input-dialog';

const ContactsPage = () => {
	const theme = useTheme();
	const dispatch = useDispatch();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);

	const [selectedContacts, setSelectedContacts] = React.useState<string[]>([]);

	const { list } = useSelector((state: StoreState) => state[StoreNames.CONTACT_CARD]);
	const drawerRef = useRef<ContactInputDialogHandle>(null);

	const addSelectedContactList = (campaign_id: string) => {
		setSelectedContacts((prev) => [...prev, campaign_id]);
	};

	const removeSelectedContactList = (campaign_id: string) => {
		setSelectedContacts((prev) => prev.filter((id) => id !== campaign_id));
	};

	const handleDeleteContacts = async () => {
		dispatch(deletingContactCard());
		selectedContacts.forEach(async (contact) => {
			ContactCardService.DeleteContacts(contact);
			dispatch(deleteContactCard(contact));
		});
	};

	const handleContactEdit = (id: string) => {
		dispatch(findContactById(id));
		dispatch(updatingContactCard());
		drawerRef.current?.open();
	};

	return (
		<Box py={'1rem'} textColor={theme === 'dark' ? 'white' : 'black'}>
			<HStack px={4}>
				<HStack width={'full'}>
					<Icon as={MdContacts} height={5} width={5} color={'green.400'} />
					<Text fontSize={'xl'}>Contacts</Text>
				</HStack>
				<HStack>
					<Button
						leftIcon={<Icon as={MdContactPage} height={5} width={5} />}
						colorScheme={'green'}
						variant={'solid'}
						size={'sm'}
						onClick={() => drawerRef.current?.open()}
					>
						Add Contact
					</Button>
					<Button
						isDisabled={selectedContacts.length === 0}
						leftIcon={<Icon as={DeleteIcon} height={5} width={5} />}
						colorScheme={'red'}
						variant={'solid'}
						size={'sm'}
						onClick={() => {
							confirmationDialogRef.current?.open('');
						}}
					>
						Delete Contact
					</Button>
				</HStack>
			</HStack>
			<TableContainer pt={'0.5rem'}>
				<Table>
					<Thead>
						<Tr>
							<Th width={'5%'}>Sl no</Th>
							<Th width={'15%'}>QR</Th>
							<Th width={'30%'}>Name</Th>
							<Th width={'10%'}>Personal Number</Th>
							<Th width={'10%'}>Work Number</Th>
							<Th width={'15%'}>Email</Th>
							<Th width={'10%'}>Edit</Th>
						</Tr>
					</Thead>
					<Tbody>
						{list.map((contact, index) => (
							<Tr key={index}>
								<Td>
									<Checkbox
										colorScheme='green'
										mr={2}
										isChecked={selectedContacts.includes(contact.id)}
										onChange={(e) => {
											if (e.target.checked) {
												addSelectedContactList(contact.id);
											} else {
												removeSelectedContactList(contact.id);
											}
										}}
									/>
									{index + 1}.
								</Td>
								<Td>
									<QrImage base64={contact.base64} />
								</Td>
								<Td>
									<Box>
										{contact.first_name} {contact.middle_name} {contact.last_name}
									</Box>
								</Td>
								<Td>{contact.contact_details_phone?.number}</Td>
								<Td>{contact.contact_details_work?.number}</Td>
								<Td>{contact.email_personal}</Td>
								<Td>
									<IconButton
										aria-label='Edit'
										icon={<Icon as={EditIcon} />}
										onClick={() => handleContactEdit(contact.id)}
									/>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
			<ContactInputDialog ref={drawerRef} />
			<ConfirmationDialog
				type={'Campaign'}
				ref={confirmationDialogRef}
				onConfirm={handleDeleteContacts}
			/>
		</Box>
	);
};

export default ContactsPage;
