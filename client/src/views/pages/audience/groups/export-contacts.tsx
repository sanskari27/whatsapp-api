import {
	Box,
	Button,
	Center,
	Checkbox,
	Flex,
	Icon,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
	useToast,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { useEffect, useRef, useState } from 'react';
import { PiExportBold, PiFileCsvLight } from 'react-icons/pi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { EXPORTS_TYPE, NAVIGATION } from '../../../../config/const';
import ContactService from '../../../../services/contact.service';
import GroupService from '../../../../services/group.service';
import LabelService from '../../../../services/label.service';
import { StoreNames, StoreState } from '../../../../store';
import { setContactsCount } from '../../../../store/reducers/UserDetailsReducers';
import CheckButton from '../../../components/check-button';

const initialExportCriteria = {
	[EXPORTS_TYPE.ALL]: false,
	[EXPORTS_TYPE.SAVED]: false,
	[EXPORTS_TYPE.UNSAVED]: false,
	[EXPORTS_TYPE.SAVED_CHAT]: false,
	[EXPORTS_TYPE.GROUP]: false,
	[EXPORTS_TYPE.GROUP_ALL]: false,
	[EXPORTS_TYPE.LABEL]: false,
	[EXPORTS_TYPE.LABEL_ALL]: false,
	[EXPORTS_TYPE.BUSINESS_ONLY]: false,
};

const initialUIDetails = {
	exportClicked: false,
	isBusiness: true,
	selectAllGroups: false,
	selectAllLabels: false,
	CSV_EXPORTING: false,
	VCF_EXPORTING: false,
};

export default function ExportContacts() {
	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });
	const dispatch = useDispatch();
	const toast = useToast();
	const navigate = useNavigate();
	const generatingCount = useRef(false);

	const handleClose = () => {
		navigate(NAVIGATION.AUDIENCE + NAVIGATION.GROUP);
	};

	const {
		groups,
		labels,
		isSubscribed,
		contactsCount,
		current_profile_type: userType,
	} = useSelector((state: StoreState) => state[StoreNames.USER]);

	useEffect(() => {
		if (contactsCount !== null || generatingCount.current) {
			return;
		}
		ContactService.contactCount()
			.then((res) => {
				dispatch(
					setContactsCount({
						[EXPORTS_TYPE.ALL]: res.total,
						[EXPORTS_TYPE.SAVED]: res.saved,
						[EXPORTS_TYPE.UNSAVED]: res.unsaved,
						[EXPORTS_TYPE.SAVED_CHAT]: res.saved_chat,
					})
				);
			})
			.finally(() => {
				generatingCount.current = true;
			});
	}, [contactsCount, dispatch]);

	const [export_criteria, setExportCriteria] = useState(initialExportCriteria);

	const [selectedGroup, setSelectedGroup] = useState([]);
	const [selectedLabel, setSelectedLabel] = useState([]);

	const [uiDetails, setUIDetails] = useState(initialUIDetails);

	const { ALL, SAVED, UNSAVED, GROUP, LABEL, BUSINESS_ONLY, SAVED_CHAT } = export_criteria;

	const handleChange = async ({ name, value }: { name: string; value: boolean }) => {
		setExportCriteria((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const exportContacts = (vcf_only = false) => {
		setUIDetails((prevState) => ({
			...prevState,
			[vcf_only ? 'VCF_EXPORTING' : 'CSV_EXPORTING']: true,
		}));

		const selectedGroups = export_criteria[EXPORTS_TYPE.GROUP]
			? export_criteria[EXPORTS_TYPE.GROUP_ALL]
				? groups.map((item) => item.id)
				: selectedGroup
			: undefined;

		const selectedLabels = export_criteria[EXPORTS_TYPE.LABEL]
			? export_criteria[EXPORTS_TYPE.LABEL_ALL]
				? labels.map((item) => item.id)
				: selectedLabel
			: undefined;
		const business_contacts_only = export_criteria[EXPORTS_TYPE.BUSINESS_ONLY];
		const opts = {
			vcf_only,
			business_contacts_only,
		};

		if (ALL) {
			ContactService.contacts(opts);
		}

		if (SAVED) {
			ContactService.contacts({
				saved_contacts: true,
				...opts,
			});
		}

		if (SAVED_CHAT) {
			ContactService.contacts({
				saved_chat_contacts: true,
				...opts,
			});
		}

		if (UNSAVED) {
			ContactService.contacts({
				...opts,
				non_saved_contacts: true,
			});
		}

		if (GROUP && selectedGroups && selectedGroups.length > 0) {
			GroupService.fetchGroup(selectedGroups, opts);
		}

		if (LABEL && selectedLabels && selectedLabels.length > 0) {
			LabelService.fetchLabel(selectedLabels, opts);
		}

		if (
			ALL ||
			SAVED ||
			SAVED_CHAT ||
			UNSAVED ||
			(selectedGroups && selectedGroups.length > 0) ||
			(selectedLabels && selectedLabels.length > 0)
		) {
			toast({
				title: 'Export in progress.',
				description: 'Check background tasks for further details',
				status: 'success',
				duration: 3000,
				isClosable: true,
			});
		}

		onClose();
	};

	const handleSubscription = async () => {
		window.open('https://whatsleads.in/pricing', '_blank');
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} onCloseComplete={handleClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					<Flex alignItems='center' gap={'0.5rem'}>
						<Icon as={PiFileCsvLight} height={5} width={5} color={'green.400'} />
						<Text fontSize='md'>Exports</Text>
					</Flex>
				</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<Flex direction={'column'} gap={'0.5rem'}>
						<Box className='bg-[#ECECEC] ' p={'0.5rem'} borderRadius={'20px'}>
							<Flex flexDirection={'column'} gap={'0.5rem'} width={'full'}>
								<Flex alignItems='flex-end' justifyContent={'space-between'}>
									<CheckButton
										name={'ALL'}
										label='All Contacts'
										value={ALL}
										onChange={handleChange}
									/>
									<Text fontSize='xs' className='text-black '>
										{!contactsCount ? 'Loading...' : `${contactsCount[EXPORTS_TYPE.ALL]} Contacts`}
									</Text>
								</Flex>
								<Flex alignItems='flex-end' justifyContent={'space-between'}>
									<CheckButton
										name={'SAVED_CHAT'}
										label='All Saved Chat Contacts'
										value={SAVED_CHAT}
										onChange={handleChange}
									/>
									<Text fontSize='xs' className='text-black '>
										{!contactsCount
											? 'Loading...'
											: `${contactsCount[EXPORTS_TYPE.SAVED_CHAT]} Contacts`}
									</Text>
								</Flex>
								<Flex alignItems='flex-end' justifyContent={'space-between'}>
									<CheckButton
										name={'SAVED'}
										label='All Phonebook Contacts'
										value={SAVED}
										onChange={handleChange}
									/>
									<Text fontSize='xs' className='text-black '>
										{!contactsCount
											? 'Loading...'
											: `${contactsCount[EXPORTS_TYPE.SAVED]} Contacts`}
									</Text>
								</Flex>
								<Flex alignItems='flex-end' justifyContent={'space-between'}>
									<CheckButton
										name={'UNSAVED'}
										label='All Unsaved Contacts'
										value={UNSAVED}
										onChange={handleChange}
									/>
									<Text fontSize='xs' className='text-black '>
										{!contactsCount
											? 'Loading...'
											: `${contactsCount[EXPORTS_TYPE.UNSAVED]} Contacts`}
									</Text>
								</Flex>
								<Flex alignItems='flex-end' justifyContent={'space-between'}>
									<CheckButton
										name={'GROUP'}
										label='Group Contacts'
										value={GROUP}
										onChange={handleChange}
									/>
								</Flex>
								<Flex alignItems='center' justifyContent='space-between'>
									<Multiselect
										disable={!GROUP || export_criteria[EXPORTS_TYPE.GROUP_ALL]}
										displayValue='name'
										placeholder='Select Group'
										onRemove={(selectedList) =>
											setSelectedGroup(selectedList.map((group: { id: string }) => group.id))
										}
										onSelect={(selectedList) => {
											setSelectedGroup(selectedList.map((group: { id: string }) => group.id));
										}}
										showCheckbox={true}
										hideSelectedList={true}
										options={groups}
										style={{
											searchBox: {
												border: 'none',
											},
										}}
										className='!w-[300px] !mr-2 !bg-[#A6A6A6]  rounded-md border-none '
									/>
									<Button
										onClick={() => {
											handleChange({
												name: 'GROUP_ALL',
												value: !export_criteria[EXPORTS_TYPE.GROUP_ALL],
											});
											setUIDetails((prevState) => ({
												...prevState,
												selectAllGroups: !export_criteria[EXPORTS_TYPE.GROUP_ALL],
											}));
										}}
										isDisabled={!GROUP}
										size='sm'
										className={`${
											uiDetails.selectAllGroups ? '!bg-green-400' : '!bg-[#A6A6A6] '
										} !text-white`}
										color={'white'}
									>
										ALL
									</Button>
								</Flex>
								<Flex
									alignItems='flex-end'
									justifyContent={'space-between'}
									hidden={userType === 'PERSONAL'}
								>
									<CheckButton
										name={'LABEL'}
										label='Label Contacts'
										value={LABEL}
										isDisabled={userType !== 'BUSINESS'}
										onChange={handleChange}
									/>
								</Flex>
								<Flex
									alignItems='center'
									justifyContent='space-between'
									hidden={userType === 'PERSONAL'}
								>
									<Multiselect
										disable={!LABEL || export_criteria[EXPORTS_TYPE.LABEL_ALL]}
										displayValue='name'
										placeholder={
											uiDetails.isBusiness ? 'Select Label' : 'For Business Account Only'
										}
										onRemove={(selectedList) =>
											setSelectedLabel(selectedList.map((label: { id: string }) => label.id))
										}
										onSelect={(selectedList) =>
											setSelectedLabel(selectedList.map((label: { id: string }) => label.id))
										}
										showCheckbox={true}
										hideSelectedList={true}
										options={labels}
										style={{
											searchBox: {
												border: 'none',
											},
											inputField: {
												width: '100%',
											},
										}}
										className='!w-[300px] !mr-2 !bg-[#A6A6A6]  rounded-md border-none '
									/>
									<Button
										onClick={() => {
											handleChange({
												name: 'LABEL_ALL',
												value: !export_criteria[EXPORTS_TYPE.LABEL_ALL],
											});
											setUIDetails((prevState) => ({
												...prevState,
												selectAllLabels: !export_criteria[EXPORTS_TYPE.LABEL_ALL],
											}));
										}}
										isDisabled={!LABEL}
										size='sm'
										className={`${
											uiDetails.selectAllLabels ? '!bg-green-400' : '!bg-[#A6A6A6] '
										} !text-white`}
										color={'white'}
									>
										ALL
									</Button>
								</Flex>
							</Flex>
						</Box>
						<Center>
							<Checkbox
								colorScheme='green'
								mr={2}
								isChecked={BUSINESS_ONLY}
								onChange={(e) =>
									handleChange({
										name: 'BUSINESS_ONLY',
										value: e.target.checked,
									})
								}
							/>
							Business Contacts Only
						</Center>
					</Flex>
				</ModalBody>
				<ModalFooter>
					{!isSubscribed ? (
						<Button
							bgColor={'yellow.400'}
							_hover={{
								bgColor: 'yellow.500',
							}}
							width={'100%'}
							onClick={handleSubscription}
						>
							<Flex gap={'0.5rem'}>
								<Text color={'white'}>Subscribe</Text>
							</Flex>
						</Button>
					) : !uiDetails.exportClicked ? (
						<Button
							bgColor={'green.300'}
							_hover={{
								bgColor: 'green.400',
							}}
							width={'100%'}
							isDisabled={
								!(
									ALL ||
									SAVED ||
									SAVED_CHAT ||
									UNSAVED ||
									uiDetails.selectAllGroups ||
									selectedGroup.length > 0 ||
									uiDetails.selectAllLabels ||
									selectedLabel.length > 0
								)
							}
							onClick={() =>
								setUIDetails((prevState) => ({
									...prevState,
									exportClicked: true,
								}))
							}
						>
							<Flex gap={'0.5rem'}>
								<Icon as={PiExportBold} width={5} height={5} color={'white'} />
								<Text color={'white'}>Export</Text>
							</Flex>
						</Button>
					) : (
						<Flex justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
							<Button
								bgColor={'green.300'}
								_hover={{
									bgColor: 'green.400',
								}}
								width={'48%'}
								onClick={() => exportContacts(false)}
								isLoading={uiDetails.CSV_EXPORTING}
							>
								<Text color={'white'}>CSV</Text>
							</Button>
							<Button
								bgColor={'yellow.400'}
								_hover={{
									bgColor: 'yellow.500',
								}}
								width={'48%'}
								isLoading={uiDetails.VCF_EXPORTING}
								onClick={() => exportContacts(true)}
							>
								<Text color={'white'}>VCF</Text>
							</Button>
						</Flex>
					)}
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
