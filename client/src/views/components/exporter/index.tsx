import {
	Box,
	Button,
	Flex,
	Icon,
	Modal,
	ModalBody,
	ModalContent,
	ModalFooter,
	ModalHeader,
	ModalOverlay,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { PiExportBold, PiFileCsvLight } from 'react-icons/pi';
import { EXPORTS_TYPE } from '../../../config/const';
import { logout, useAuth } from '../../../hooks/useAuth';
import AuthService from '../../../services/auth.service';
import ContactService from '../../../services/contact.service';
import GroupService from '../../../services/group.service';
import LabelService from '../../../services/label.service';
import CheckButton from '../check-button';

export type ExportsModalHandler = {
	open: () => void;
};

const initialExportCriteria = {
	[EXPORTS_TYPE.ALL]: false,
	[EXPORTS_TYPE.SAVED]: false,
	[EXPORTS_TYPE.UNSAVED]: false,
	[EXPORTS_TYPE.GROUP]: false,
	[EXPORTS_TYPE.GROUP_ALL]: false,
	[EXPORTS_TYPE.LABEL]: false,
	[EXPORTS_TYPE.LABEL_ALL]: false,
};

const ExporterModal = forwardRef<ExportsModalHandler>((_, ref) => {
	const { isOpen, onOpen, onClose } = useDisclosure();

	useImperativeHandle(ref, () => ({
		open: () => {
			onOpen();
			setExportCriteria(initialExportCriteria);
		},
	}));

	const [export_criteria, setExportCriteria] = useState(initialExportCriteria);

	const [exporting, setExporting] = useState({
		CSV: false,
		VCF: false,
	});

	const [contactsCount, setContactsCount] = useState({
		[EXPORTS_TYPE.ALL]: 0,
		[EXPORTS_TYPE.SAVED]: 0,
		[EXPORTS_TYPE.UNSAVED]: 0,
	});

	const { isAuthenticated } = useAuth();

	const [selectedGroup, setSelectedGroup] = useState([]);
	const [selectedLabel, setSelectedLabel] = useState([]);

	const [uiDetails, setUIDetails] = useState({
		exportClicked: false,
		paymentVerified: false,
		isBusiness: true,
		selectAllGroups: false,
		selectAllLabels: false,
	});

	const [Loading, setLoading] = useState({
		contactLoading: false,
		groupLoading: false,
		labelLoading: false,
	});

	const { ALL, SAVED, UNSAVED, GROUP, LABEL } = export_criteria;

	const handleChange = async ({ name, value }: { name: string; value: boolean }) => {
		setExportCriteria((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const [groups, setGroups] = useState([
		{
			id: '',
			name: 'No Group Selected!',
		},
	]);
	const [labels, setLabels] = useState([
		{
			id: '',
			name: 'No Label Selected!',
		},
	]);

	const exportContacts = (vcf_only = false) => {
		if (vcf_only) {
			setExporting((prevState) => ({
				...prevState,
				VCF: true,
			}));
		} else {
			setExporting((prevState) => ({
				...prevState,
				CSV: true,
			}));
		}

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

		if (ALL) {
			ContactService.contacts({ vcf_only });
		}

		if (SAVED) {
			ContactService.contacts({ saved_contacts: true, vcf_only });
		}

		if (UNSAVED) {
			ContactService.contacts({ non_saved_contacts: false, vcf_only });
		}

		if (GROUP && selectedGroups && selectedGroups.length > 0) {
			GroupService.fetchGroup(selectedGroups, vcf_only);
		}

		if (LABEL && selectedLabels && selectedLabels.length > 0) {
			LabelService.fetchLabel(selectedLabels, vcf_only);
		}

		setUIDetails((prevState) => ({
			...prevState,
			exportClicked: false,
		}));

		setExporting((prevState) => ({
			...prevState,
			CSV: false,
			VCF: false,
		}));
	};

	const handleSubscription = async () => {
		window.open('https://whatsleads.in/pricing', '_blank');
	};

	useEffect(() => {
		setLoading({
			contactLoading: true,
			groupLoading: true,
			labelLoading: true,
		});
		ContactService.contactCount()
			.then((res) => {
				setContactsCount({
					[EXPORTS_TYPE.ALL]: res.total,
					[EXPORTS_TYPE.SAVED]: res.saved,
					[EXPORTS_TYPE.UNSAVED]: res.unsaved,
				});
			})
			.catch(logout)
			.finally(() => {
				setLoading((prevState) => ({
					...prevState,
					contactLoading: false,
				}));
			});
		GroupService.listGroups()
			.then(setGroups)
			.finally(() => {
				setLoading((prevState) => ({
					...prevState,
					groupLoading: false,
				}));
			});

		LabelService.listLabels()
			.then(setLabels)
			.catch((err) => {
				if (err === 'BUSINESS_ACCOUNT_REQUIRED') {
					setUIDetails((prevState) => ({
						...prevState,
						isBusiness: false,
					}));
				}
			})
			.finally(() => {
				setLoading((prevState) => ({
					...prevState,
					labelLoading: false,
				}));
			});
		AuthService.getUserDetails().then((res) => {
			setUIDetails((prevState) => ({
				...prevState,
				paymentVerified: res.isSubscribed,
			}));
		});
	}, []);

	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'lg'}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>
					<Flex alignItems='center' gap={'0.5rem'} mt={'1.5rem'}>
						<Icon as={PiFileCsvLight} height={5} width={5} color={'green.400'} />
						<Text className='text-black dark:text-white' fontSize='md'>
							Exports
						</Text>
					</Flex>
				</ModalHeader>
				<ModalBody>
					<Flex direction={'column'} gap={'0.5rem'} justifyContent={'space-between'}>
						<Flex direction={'column'} gap={'0.5rem'}>
							<Box
								className='bg-[#ECECEC] dark:bg-[#535353]'
								p={'0.5rem'}
								borderRadius={'20px'}
								mb={'1rem'}
							>
								<Flex flexDirection={'column'} gap={'0.5rem'} width={'full'}>
									<Flex alignItems='flex-end' justifyContent={'space-between'}>
										<CheckButton
											name={'ALL'}
											label='All Chat Contacts'
											value={ALL}
											onChange={handleChange}
										/>
										<Text fontSize='xs' className='text-black dark:text-white'>
											{Loading.contactLoading
												? 'Loading...'
												: `${contactsCount[EXPORTS_TYPE.ALL]} Contacts`}
										</Text>
									</Flex>
									<Flex alignItems='flex-end' justifyContent={'space-between'}>
										<CheckButton
											name={'SAVED'}
											label='All Saved Contacts'
											value={SAVED}
											onChange={handleChange}
										/>
										<Text fontSize='xs' className='text-black dark:text-white'>
											{Loading.contactLoading
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
										<Text fontSize='xs' className='text-black dark:text-white'>
											{Loading.contactLoading
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
										<Text
											fontSize='xs'
											className='text-black dark:text-white'
											hidden={!isAuthenticated}
										>
											{Loading.groupLoading ? 'Loading...' : `${groups.length} Groups`}
										</Text>
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
											className='!w-[300px] !mr-2 !bg-[#A6A6A6] dark:!bg-[#252525] rounded-md border-none '
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
												uiDetails.selectAllGroups
													? '!bg-green-400'
													: '!bg-[#A6A6A6] dark:!bg-[#252525]'
											} !text-white`}
											color={'white'}
										>
											{uiDetails.selectAllGroups ? 'Deselect All' : 'Select All'}
										</Button>
									</Flex>
									<Flex alignItems='flex-end' justifyContent={'space-between'}>
										<CheckButton
											name={'LABEL'}
											label='Label Contacts'
											value={LABEL}
											isDisabled={!uiDetails.isBusiness}
											onChange={handleChange}
										/>
										<Text
											fontSize='xs'
											className='text-black dark:text-white '
											hidden={!isAuthenticated || !uiDetails.isBusiness}
										>
											{Loading.labelLoading ? 'Loading...' : `${labels.length} Labels`}
										</Text>
									</Flex>
									<Flex alignItems='center' justifyContent='space-between'>
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
											className='!w-[300px] !mr-2 !bg-[#A6A6A6] dark:!bg-[#252525] rounded-md border-none '
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
												uiDetails.selectAllLabels
													? '!bg-green-400'
													: '!bg-[#A6A6A6] dark:!bg-[#252525]'
											} !text-white`}
											color={'white'}
										>
											{uiDetails.selectAllLabels ? 'Deselect All' : 'Select All'}
										</Button>
									</Flex>
								</Flex>
							</Box>
						</Flex>
					</Flex>
				</ModalBody>
				<ModalFooter>
					{!uiDetails.paymentVerified ? (
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
								isLoading={exporting.CSV}
							>
								<Text color={'white'}>CSV</Text>
							</Button>
							<Button
								bgColor={'yellow.400'}
								_hover={{
									bgColor: 'yellow.500',
								}}
								width={'48%'}
								isLoading={exporting.VCF}
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
});

export default ExporterModal;
