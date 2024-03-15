import { DeleteIcon } from '@chakra-ui/icons';
import {
	Button,
	Drawer,
	DrawerBody,
	DrawerCloseButton,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerOverlay,
	FormControl,
	FormLabel,
	HStack,
	Input,
	InputGroup,
	InputLeftAddon,
	InputRightAddon,
	Select,
	Text,
	VStack,
	useDisclosure,
	useToast,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { COUNTRIES, Colors, NAVIGATION } from '../../../../config/const';
import ContactCardService from '../../../../services/contact-card.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addContactCard,
	addContactNumberOther,
	addLink,
	clearContactCard,
	findContactById,
	removeContactNumberOther,
	removeLink,
	savingContactCard,
	setCity,
	setContactNumberOther,
	setContactNumberPhone,
	setContactNumberWork,
	setCountry,
	setEmailPersonal,
	setEmailWork,
	setError,
	setFirstName,
	setLastName,
	setLinks,
	setMiddleName,
	setOrganization,
	setPincode,
	setState,
	setStreet,
	setTitle,
	stopSavingContactCard,
	updateContactCard,
	updatingContactCard,
} from '../../../../store/reducers/ContactCardReducers';
import Each from '../../../../utils/Each';
import LocationInputDialog, { LocationInputDialogHandle } from '../../../components/location-input';

const ContactDetailsDialog = () => {
	const dispatch = useDispatch();
	const toast = useToast();
	const navigate = useNavigate();
	const { id } = useParams();
	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

	const locationInputDialog = useRef<LocationInputDialogHandle>(null);

	const { selectedCard, uiDetails } = useSelector(
		(state: StoreState) => state[StoreNames.CONTACT_CARD]
	);
	const {
		first_name,
		last_name,
		middle_name,
		title,
		organization,
		city,
		country,
		email_personal,
		email_work,
		pincode,
		state,
		street,
		contact_other,
		contact_phone,
		contact_work,
		links,
	} = selectedCard;

	const { error, isUpdating, isSaving } = uiDetails;

	useEffect(() => {
		if (!id) return;
		dispatch(findContactById(id));
		dispatch(updatingContactCard());
	}, [id, dispatch]);

	const handleClose = () => {
		dispatch(clearContactCard());
		navigate(NAVIGATION.MEDIA + NAVIGATION.CONTACT);
	};

	const handleSave = () => {
		dispatch(setError(''));
		dispatch(savingContactCard());
		const details = {
			contact_phone: '',
			contact_work: '',
			contact_other: [] as string[],
		};
		if (contact_phone?.number) {
			details.contact_phone = `${contact_phone.country_code ?? '91'}${contact_phone.number}`;
		}
		if (contact_work?.number) {
			details.contact_work = `${contact_work.country_code ?? '91'}${contact_work.number}`;
		}
		if (contact_other?.length) {
			details.contact_other = contact_other.map(
				(number) => `${number.country_code ?? '91'}${number.number}`
			);
		}
		const data = { ...selectedCard, ...details };

		const promise = isUpdating
			? ContactCardService.UpdateContactCard(data)
			: ContactCardService.CreateContactCard(data);

		toast.promise(promise, {
			success: (data) => {
				const acton = isUpdating ? updateContactCard(data) : addContactCard(data);
				dispatch(acton);
				handleClose();
				return {
					title: 'Contact Card saved successfully',
				};
			},
			error: () => {
				dispatch(stopSavingContactCard());
				return {
					title: isUpdating ? 'Failed to update Contact Card' : 'Failed to save Contact Card',
				};
			},
			loading: {
				title: isUpdating ? 'Updating Contact Card' : 'Saving Data',
				description: 'Please wait',
			},
		});
	};

	const updateContactNumber = (
		type: 'PHONE' | 'WORK' | 'OTHER',
		key: 'country_code' | 'number',
		value: string | undefined,
		index?: number
	) => {
		if (isNaN(Number(value))) return;
		if (type === 'PHONE') {
			dispatch(
				setContactNumberPhone({
					...contact_phone,
					[key]: value,
				} as { country_code: string; number: string })
			);
		}
		if (type === 'WORK') {
			dispatch(
				setContactNumberWork({
					...contact_work,
					[key]: value,
				} as { country_code: string; number: string })
			);
		}
		if (type === 'OTHER') {
			if (index === undefined) return;
			dispatch(
				setContactNumberOther({
					index,
					...contact_other?.[index],
					[key]: value,
				} as { index: number; country_code: string; number: string })
			);
		}
	};

	return (
		<Drawer
			isOpen={isOpen}
			onClose={onClose}
			placement='right'
			size={'lg'}
			onCloseComplete={handleClose}
		>
			<DrawerOverlay />
			<DrawerContent textColor={Colors.PRIMARY_DARK} backgroundColor={Colors.BACKGROUND_LIGHT}>
				<DrawerCloseButton onClick={onClose} />
				<DrawerHeader>{isUpdating ? 'Contact Details' : 'Create new contact card'}</DrawerHeader>

				<DrawerBody>
					<VStack width={'full'} alignItems={'stretch'} gap={'2rem'}>
						<VStack width={'full'} alignItems={'stretch'} gap={'1rem'}>
							<TextInput
								placeholder='First name'
								onTextChange={(text) => dispatch(setFirstName(text))}
								value={first_name ?? ''}
							/>
							<HStack>
								<TextInput
									placeholder='Middle name'
									onTextChange={(text) => dispatch(setMiddleName(text))}
									value={middle_name ?? ''}
								/>
								<TextInput
									placeholder='Last name'
									onTextChange={(text) => dispatch(setLastName(text))}
									value={last_name ?? ''}
								/>
							</HStack>
						</VStack>
						<VStack width={'full'} alignItems={'stretch'} gap={'1rem'}>
							<Text fontWeight={'medium'}>Contact Details</Text>
							<HStack>
								<TextInput
									placeholder='Title'
									onTextChange={(text) => dispatch(setTitle(text))}
									value={title ?? ''}
								/>
								<TextInput
									placeholder='Organization'
									onTextChange={(text) => dispatch(setOrganization(text))}
									value={organization ?? ''}
								/>
							</HStack>
							<TextInput
								placeholder='Personal Email'
								onTextChange={(text) => dispatch(setEmailPersonal(text))}
								value={email_personal ?? ''}
							/>
							<TextInput
								placeholder='Work Email'
								onTextChange={(text) => dispatch(setEmailWork(text))}
								value={email_work ?? ''}
							/>

							<PhoneNumberInput
								type='PHONE'
								number={contact_phone?.number}
								country_code={contact_phone?.country_code}
								onTextChange={(type, key, text) => updateContactNumber(type, key, text)}
								placeholder='Primary Phone Number'
							/>
							<PhoneNumberInput
								type='WORK'
								number={contact_work?.number}
								country_code={contact_work?.country_code}
								onTextChange={(type, key, text) => updateContactNumber(type, key, text)}
								placeholder='Work Phone Number'
							/>

							<VStack width={'full'} alignItems={'stretch'} gap={'0.5rem'}>
								<HStack justifyContent={'space-between'} width={'full'}>
									<Text>Other Phone Number</Text>
									<Button
										size={'sm'}
										colorScheme='green'
										variant={'outline'}
										onClick={() =>
											dispatch(
												addContactNumberOther({
													country_code: '91',
													number: '',
												})
											)
										}
									>
										Add Number
									</Button>
								</HStack>
								<Each
									items={contact_other ?? []}
									render={(item, index) => (
										<PhoneNumberInput
											remove_icon
											onRemove={() => dispatch(removeContactNumberOther(index))}
											type='OTHER'
											number={item?.number}
											country_code={item?.country_code}
											onTextChange={(type, key, text) =>
												updateContactNumber(type, key, text, index)
											}
										/>
									)}
								/>
							</VStack>
						</VStack>

						<VStack width={'full'} alignItems={'stretch'} gap={'1rem'}>
							<HStack
								justifyContent={'space-between'}
								width={'full'}
								pb={(links ?? []).length > 0 ? '1rem' : 0}
							>
								<Text fontWeight={'medium'}>Websites and Social Media links</Text>
								<Button
									size={'sm'}
									colorScheme='green'
									variant={'outline'}
									onClick={() => dispatch(addLink(''))}
								>
									Add Websites
								</Button>
							</HStack>
							<Each
								items={links ?? []}
								render={(link, index) => (
									<LinkInput
										value={link ?? ''}
										onTextChange={(url) => dispatch(setLinks({ index, url }))}
										onRemove={() => dispatch(removeLink(index))}
									/>
								)}
							/>
						</VStack>

						<VStack width={'full'} alignItems={'stretch'} gap={'0.5rem'}>
							<Text fontWeight={'medium'}>Address Details</Text>
							<TextInput
								placeholder='Street'
								onTextChange={(text) => dispatch(setStreet(text))}
								value={street ?? ''}
							/>
							<HStack>
								<TextInput
									placeholder='City'
									onTextChange={(text) => dispatch(setCity(text))}
									value={city ?? ''}
								/>
								<TextInput
									placeholder='State'
									onTextChange={(text) => dispatch(setState(text))}
									value={state ?? ''}
								/>
							</HStack>
							<HStack>
								<TextInput
									placeholder='Country'
									onTextChange={(text) => dispatch(setCountry(text))}
									value={country ?? ''}
								/>
								<TextInput
									placeholder='Pincode'
									onTextChange={(text) => dispatch(setPincode(text))}
									value={pincode ?? ''}
								/>
							</HStack>
							<Button
								colorScheme='green'
								variant={'outline'}
								onClick={() => locationInputDialog.current?.open()}
							>
								Add Google Maps Location
							</Button>
						</VStack>
					</VStack>
				</DrawerBody>

				<DrawerFooter width={'full'} justifyContent={'space-between'}>
					<Text textColor='tomato'>{error ? error : ''}</Text>
					<HStack>
						<Button variant='outline' colorScheme='red' mr={3} onClick={onClose}>
							Cancel
						</Button>
						<Button isLoading={isSaving} colorScheme='green' onClick={handleSave}>
							Save
						</Button>
					</HStack>
				</DrawerFooter>
			</DrawerContent>
			<LocationInputDialog
				ref={locationInputDialog}
				onConfirm={(link) => dispatch(addLink(link))}
			/>
		</Drawer>
	);
};

export default ContactDetailsDialog;

function LinkInput({
	onTextChange,
	value,
	onRemove,
}: {
	value?: string;
	onTextChange: (text: string) => void;
	onRemove?: () => void;
}) {
	return (
		<FormControl flex={1}>
			<InputGroup borderColor={Colors.ACCENT_DARK} borderWidth={'1px'} rounded='md'>
				<InputLeftAddon
					border={'none'}
					borderRight={`1px ${Colors.ACCENT_DARK} solid`}
					bgColor={Colors.ACCENT_LIGHT}
					color={Colors.ACCENT_DARK}
					p={2}
				>
					https://
				</InputLeftAddon>
				<Input
					placeholder='eg. www.google.com'
					type='url'
					variant='unstyled'
					py={'0.5rem'}
					px={'1rem'}
					value={value ?? ''}
					onChange={(e) => onTextChange(e.target.value)}
				/>
				<InputRightAddon
					border={'none'}
					bgColor={'red.300'}
					cursor={'pointer'}
					_hover={{
						bgColor: 'red.600',
					}}
					onClick={onRemove}
				>
					<DeleteIcon color={'white'} />
				</InputRightAddon>
			</InputGroup>
		</FormControl>
	);
}

function PhoneNumberInput({
	placeholder,
	onTextChange,
	country_code,
	number,
	type,
	remove_icon,
	onRemove,
}: {
	placeholder?: string;
	country_code?: string;
	number?: string;
	type: 'PHONE' | 'WORK' | 'OTHER';
	onTextChange: (
		type: 'PHONE' | 'WORK' | 'OTHER',
		key: 'country_code' | 'number',
		text: string
	) => void;
	remove_icon?: boolean;
	onRemove?: () => void;
}) {
	return (
		<FormControl flex={1}>
			{placeholder ? <FormLabel color={Colors.PRIMARY_DARK}>{placeholder}</FormLabel> : null}
			<InputGroup borderColor={Colors.ACCENT_DARK} borderWidth={'1px'} rounded='md'>
				<InputLeftAddon
					border={'none'}
					borderRight={`1px ${Colors.ACCENT_DARK} solid`}
					bgColor={'transparent'}
					p={0}
					children={
						<Select
							width={'100px'}
							icon={<MdArrowDropDown />}
							value={country_code ?? ''}
							border={'none'}
							focusBorderColor='transparent'
							color={Colors.ACCENT_DARK}
							onChange={(e) => onTextChange(type, 'country_code', e.target.value)}
						>
							<Each
								items={Object.keys(COUNTRIES)}
								render={(code) => <option value={code}>+{code}</option>}
							/>
						</Select>
					}
				/>
				<Input
					type='tel'
					placeholder='eg. 89XXXXXX43'
					variant='unstyled'
					py={'0.5rem'}
					px={'1rem'}
					value={number ?? ''}
					onChange={(e) => {
						onTextChange(type, 'number', e.target.value);
					}}
				/>
				{remove_icon ? (
					<InputRightAddon
						border={'none'}
						bgColor={'red.300'}
						cursor={'pointer'}
						_hover={{
							bgColor: 'red.600',
						}}
						onClick={onRemove}
					>
						<DeleteIcon color={'white'} />
					</InputRightAddon>
				) : null}
			</InputGroup>
		</FormControl>
	);
}

function TextInput({
	placeholder,
	value,
	onTextChange,
}: {
	placeholder: string;
	value: string;
	onTextChange: (txt: string) => void;
}) {
	return (
		<FormControl flex={1}>
			<FormLabel color={Colors.PRIMARY_DARK}>{placeholder}</FormLabel>
			<Input
				type='text'
				variant='unstyled'
				value={value}
				onChange={(e) => onTextChange(e.target.value)}
				placeholder={placeholder}
				_placeholder={{
					color: Colors.ACCENT_DARK,
					opacity: 0.7,
				}}
				borderColor={Colors.ACCENT_DARK}
				borderWidth={'1px'}
				padding={'0.5rem'}
				marginTop={'-0.5rem'}
			/>
		</FormControl>
	);
}
