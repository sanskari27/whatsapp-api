/* eslint-disable @typescript-eslint/no-explicit-any */
import { AddIcon, EditIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogOverlay,
	Box,
	Button,
	Center,
	Divider,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	HStack,
	Heading,
	IconButton,
	Input,
	Select,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	Textarea,
	VStack,
	useDisclosure,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MdCampaign, MdDelete } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import useTemplate from '../../../hooks/useTemplate';
import { useTheme } from '../../../hooks/useTheme';
import MessageService from '../../../services/message.service';
import { StoreNames, StoreState } from '../../../store';
import {
	addScheduler,
	reset,
	setAttachments,
	setBatchDelay,
	setBatchSize,
	setCSVFile,
	setCampaignName,
	setContactCards,
	setEndTime,
	setGroupRecipients,
	setLabelRecipients,
	setMaxDelay,
	setMessage,
	setMinDelay,
	setPolls,
	setRecipients,
	setRecipientsFrom,
	setStartTime,
	setStateDate,
	setVariables,
} from '../../../store/reducers/SchedulerReducer';
import PollInputDialog, { PollInputDialogHandle } from '../../components/polls-input-dialog';
import AttachmentSelectorDialog, {
	AttachmentDialogHandle,
} from '../../components/selector-dialog/AttachmentSelectorDialog';
import ContactSelectorDialog, {
	ContactDialogHandle,
} from '../../components/selector-dialog/ContactSelectorDialog';
import SubscriptionAlert, { SubscriptionPopup } from '../../components/subscription-alert';
import Variables from '../../components/variables';
import { MessageSchedulerList, TemplateNameInputDialog } from './components';
import NumberInputDialog from './components/numbers-input-dialog';

export type SchedulerDetails = {
	type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
	numbers?: string[];
	csv_file: string;
	group_ids: string[];
	label_ids: string[];
	message: string;
	variables: string[];
	shared_contact_cards: string[];
	attachments: string[];
	campaign_name: string;
	min_delay: number;
	max_delay: number;
	startTime: string;
	endTime: string;
	batch_delay: number;
	batch_size: number;
};

const DEFAULT_POLL = [
	{
		title: '',
		options: ['', ''],
		isMultiSelect: false,
	},
];

export default function Scheduler() {
	const attachmentRef = useRef<AttachmentDialogHandle>(null);
	const contactRef = useRef<ContactDialogHandle>(null);
	const messageRef = useRef<HTMLTextAreaElement>(null);
	const pollInputRef = useRef<PollInputDialogHandle>(null);
	const dispatch = useDispatch();
	const theme = useTheme();
	const {
		templates,
		add: addToTemplate,
		addingTemplate,
		update: updateTemplate,
		remove: removeTemplate,
	} = useTemplate();
	const [selectedTemplate, setSelectedTemplate] = useState({
		id: '',
		name: '',
	});
	const {
		isOpen: isNameInputOpen,
		onOpen: openNameInput,
		onClose: closeNameInput,
	} = useDisclosure();
	const {
		isOpen: isNumberInputOpen,
		onOpen: openNumberInput,
		onClose: closeNumberInput,
	} = useDisclosure();

	const {
		isOpen: successCampaignCreation,
		onOpen: openCampaignCreation,
		onClose: closeCampaignCreation,
	} = useDisclosure();

	const [uiDetails, setUIDetails] = useState<{
		uploadingCSV: boolean;
		deletingCSV: boolean;
		recipientsLoading: boolean;
		messageError: string;
		loadingVerifiedContacts: boolean;
		schedulingMessages: boolean;
	}>({
		uploadingCSV: false,
		deletingCSV: false,
		recipientsLoading: false,
		messageError: '',
		loadingVerifiedContacts: false,
		schedulingMessages: false,
	});

	const { details, recipients } = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const { canSendMessage, groups, labels, userType } = useSelector(
		(state: StoreState) => state[StoreNames.USER]
	);
	const { list: csvList } = useSelector((state: StoreState) => state[StoreNames.CSV]);
	const csvListWithDate = csvList.filter(
		(item) =>
			item.headers.includes('number') &&
			item.headers.includes('date') &&
			item.headers.includes('month')
	);

	const [error, setError] = useState({
		campaignName: '',
		message: '',
		minDelay: '',
		maxDelay: '',
		startTime: '',
		endTime: '',
		batchDelay: '',
		batchSize: '',
		recipients: '',
		apiError: '',
	});

	useEffect(() => {
		pushToNavbar({
			title: 'Campaign Scheduler',
			icon: MdCampaign,
			link: NAVIGATION.SCHEDULER,
		});
		return () => {
			popFromNavbar();
		};
	}, []);

	const fetchRecipients = useCallback(
		function (type: string) {
			if (type === 'GROUP' || type === 'GROUP_INDIVIDUAL') {
				dispatch(setRecipients(groups));
			} else if (type === 'LABEL') {
				dispatch(setRecipients(labels));
			} else if (type === 'CSV') {
				dispatch(setRecipients(csvList));
			}
		},
		[dispatch, groups, labels, csvList]
	);

	const setSelectedRecipients = (ids: string[]) => {
		if (details.type === 'GROUP' || details.type === 'GROUP_INDIVIDUAL') {
			dispatch(setGroupRecipients(ids));
		} else if (details.type === 'LABEL') {
			dispatch(setLabelRecipients(ids));
		}
	};

	const scheduleMessage = () => {
		if (!details.campaign_name) {
			setError((prev) => ({
				...prev,
				campaignName: 'Campaign Name is required',
			}));
			return;
		}

		if (details.type === 'CSV' && details.csv_file === '') {
			setError((prev) => ({
				...prev,
				recipients: 'Recipients are required',
			}));
			return;
		}
		if (details.type === 'GROUP' && details.group_ids.length === 0) {
			setError((prev) => ({
				...prev,
				recipients: 'Recipients are required',
			}));
			return;
		}
		if (details.type === 'GROUP_INDIVIDUAL' && details.group_ids.length === 0) {
			setError((prev) => ({
				...prev,
				recipients: 'Recipients are required',
			}));
			return;
		}
		if (details.type === 'LABEL' && details.label_ids.length === 0) {
			setError((prev) => ({
				...prev,
				recipients: 'Recipients are required',
			}));
			return;
		}
		if (
			!details.message &&
			details.attachments.length === 0 &&
			details.shared_contact_cards.length === 0 &&
			details.polls.length === 0
		) {
			setError((prev) => ({
				...prev,
				message: 'Message, attachment, contact card or poll is required ',
			}));
			return;
		}
		if (details.min_delay < 1) {
			setError((prev) => ({
				...prev,
				minDelay: 'Minimum Delay is required',
			}));
			return;
		}
		if (details.max_delay < 1) {
			setError((prev) => ({
				...prev,
				maxDelay: 'Maximum Delay is required',
			}));
			return;
		}
		if (details.batch_size < 1) {
			setError((prev) => ({
				...prev,
				batchSize: 'Batch Size is required',
			}));
			return;
		}
		if (details.batch_delay < 1) {
			setError((prev) => ({
				...prev,
				batchDelay: 'Batch Delay is required',
			}));
			return;
		}
		setUIDetails((prev) => ({
			...prev,
			schedulingMessages: true,
		}));
		MessageService.scheduleCampaign(details).then((errorMessage) => {
			if (errorMessage) {
				setUIDetails((prev) => ({
					...prev,
					schedulingMessages: false,
				}));
				setError((prev) => ({
					...prev,
					apiError: errorMessage,
				}));
				setTimeout(() => {
					setError((prev) => ({
						...prev,
						apiError: '',
					}));
				}, 5000);
				return;
			}
			openCampaignCreation();
			dispatch(reset());
			setUIDetails((prev) => ({
				...prev,
				schedulingMessages: false,
			}));
		});
	};

	const handleScheduleMessage = () => {
		if (!details.campaign_name) {
			setError((prev) => ({
				...prev,
				campaignName: 'Campaign Name is required',
			}));
			return;
		}

		if (details.type === 'CSV' && details.csv_file === '') {
			setError((prev) => ({
				...prev,
				recipients: 'Recipients are required',
			}));
			return;
		}
		if (
			!details.message &&
			details.attachments.length === 0 &&
			details.shared_contact_cards.length === 0 &&
			details.polls.length === 0
		) {
			setError((prev) => ({
				...prev,
				message: 'Message, attachment, contact card or poll is required ',
			}));
			return;
		}

		setUIDetails((prev) => ({
			...prev,
			schedulingMessages: true,
		}));

		MessageService.scheduleMessage({
			title: details.campaign_name,
			message: details.message,
			csv: csvList.find((item) => item.id === details.csv_file)?._id ?? '',
			attachments: details.attachments,
			shared_contact_cards: details.shared_contact_cards,
			polls: details.polls,
			start_from: details.startTime,
			end_at: details.endTime,
		})
			.then((res) => {
				setUIDetails((prev) => ({
					...prev,
					schedulingMessages: false,
				}));
				dispatch(addScheduler(res));
			})
			.catch(() => {});
	};

	const insertVariablesToMessage = (variable: string) => {
		dispatch(
			setMessage(
				details.message.substring(0, messageRef.current?.selectionStart) +
					variable +
					details.message.substring(messageRef.current?.selectionEnd ?? 0, details.message.length)
			)
		);
	};

	useEffect(() => {
		fetchRecipients(details.type);
	}, [fetchRecipients, details.type]);

	useEffect(() => {
		dispatch(reset());
	}, [dispatch]);

	useEffect(() => {
		MessageService.getScheduledMessages().then((res) => {
			console.log(res);
		});
	}, []);

	return (
		<Flex padding={'1rem'} justifyContent={'center'} width={'full'}>
			<Tabs isFitted variant='enclosed' width={'full'} color={theme === 'dark' ? 'white' : 'black'}>
				<TabList mb='1em'>
					<Tab onClick={() => dispatch(reset())}>Schedule Campaign</Tab>
					<Tab
						onClick={() => {
							dispatch(reset());
							dispatch(setRecipientsFrom('CSV'));
						}}
					>
						Schedule Message
					</Tab>
				</TabList>
				<TabPanels>
					{/* ------------------------------Scheduler Section----------------------------- */}
					<TabPanel width={'full'}>
						<Flex direction={'column'} width={'full'}>
							<SubscriptionPopup isVisible={!canSendMessage} />
							<Heading
								color={theme === 'dark' ? 'white' : 'GrayText'}
								fontSize={'large'}
								fontWeight={'medium'}
							>
								Campaign Details
							</Heading>
							<Box marginTop={'1rem'}>
								<Flex direction={'column'}>
									<FormControl isInvalid={!!error.campaignName}>
										<FormLabel color={theme === 'dark' ? 'white' : 'zinc.500'}>
											Campaign Name
										</FormLabel>
										<Input
											color={theme === 'dark' ? 'white' : 'gray.800'}
											type='text'
											value={details.campaign_name}
											onChange={(e) => {
												setError((prev) => ({
													...prev,
													campaignName: '',
												}));
												dispatch(setCampaignName(e.target.value));
											}}
										/>
										{error.campaignName && (
											<FormErrorMessage>{error.campaignName}</FormErrorMessage>
										)}
									</FormControl>
									{/* --------------------------RECIPIENTS INPUT------------------------ */}
									<HStack alignItems={'start'} pt={4}>
										<FormControl>
											<FormLabel color={theme === 'dark' ? 'white' : 'GrayText'}>
												Recipients From
											</FormLabel>
											<Select
												className={`!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full ${
													details.type
														? ' text-black dark:text-white'
														: ' text-gray-700 dark:text-gray-400'
												}`}
												border={'none'}
												value={details.type}
												onChange={(e) => {
													setError((prev) => ({
														...prev,
														recipients: '',
													}));
													dispatch(
														setRecipientsFrom(
															e.target.value as
																| 'NUMBERS'
																| 'CSV'
																| 'GROUP'
																| 'LABEL'
																| 'GROUP_INDIVIDUAL'
														)
													);
													fetchRecipients(e.target.value);
												}}
											>
												<option
													className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
													value='NUMBERS'
												>
													Numbers
												</option>
												<option
													className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
													value='CSV'
												>
													CSV
												</option>
												<option
													className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
													value='GROUP'
												>
													Groups
												</option>
												<option
													className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
													value='GROUP_INDIVIDUAL'
												>
													Group Individuals
												</option>
												{userType === 'BUSINESS' ? (
													<option
														className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
														value='LABEL'
													>
														Labels
													</option>
												) : null}
											</Select>
										</FormControl>
										<FormControl
											alignItems='flex-end'
											justifyContent={'space-between'}
											width={'full'}
											isInvalid={!!error.recipients}
										>
											<FormLabel color={theme === 'dark' ? 'white' : 'GrayText'}>
												{details.type === 'NUMBERS'
													? 'Selected Numbers'
													: 'Choose Existing Database'}
											</FormLabel>
											{details.type === 'CSV' ? (
												<Flex direction={'column'} gap={2}>
													<Select
														className='!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white '
														border={'none'}
														value={details.csv_file}
														onChange={(e) => {
															setError((prev) => ({
																...prev,
																recipients: '',
															}));
															dispatch(setCSVFile(e.target.value));
															const recipient = recipients.find(
																(recipient) => recipient.id === e.target.value
															);
															if (!recipient || !recipient.headers) return;
															if (recipient) dispatch(setVariables(recipient.headers));
														}}
													>
														<option
															value={'select'}
															className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
														>
															Select one!
														</option>
														{recipients.map(({ id, name }) => (
															<option
																className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
																value={id}
																key={id}
															>
																{name}
															</option>
														))}
													</Select>
												</Flex>
											) : details.type === 'NUMBERS' ? (
												<Flex direction={'column'} gap={2} justifyContent={'center'}>
													<Button
														className='!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white '
														onClick={openNumberInput}
													>
														<Text>Selected Numbers ({details.numbers?.length ?? 0})</Text>
													</Button>
												</Flex>
											) : (
												<Multiselect
													disable={uiDetails.recipientsLoading}
													displayValue='displayValue'
													placeholder={
														details.type === 'GROUP'
															? 'Select Groups'
															: details.type === 'GROUP_INDIVIDUAL'
															? 'Select Groups'
															: details.type === 'LABEL'
															? 'Select Labels'
															: 'Select One!'
													}
													onRemove={(selectedList) =>
														setSelectedRecipients(selectedList.map((label: any) => label.id))
													}
													onSelect={(selectedList) => {
														setError((prev) => ({
															...prev,
															recipients: '',
														}));
														setSelectedRecipients(selectedList.map((label: any) => label.id));
													}}
													showCheckbox={true}
													hideSelectedList={true}
													options={recipients.map((item, index) => ({
														...item,
														displayValue: `${index + 1}. ${item.name}`,
													}))}
													style={{
														searchBox: {
															border: 'none',
														},
														inputField: {
															width: '100%',
														},
													}}
													className='  bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none '
												/>
											)}
											{error.recipients && <FormErrorMessage>{error.recipients}</FormErrorMessage>}
										</FormControl>
									</HStack>
								</Flex>

								<HStack gap={8} alignItems={'start'}>
									<Flex flex={1} direction={'column'} gap={2}>
										{/* ----------------------------MESSAGE INPUT SECTION------------------- */}
										<Box justifyContent={'space-between'}>
											<Text className='text-gray-700 dark:text-white' py={4} fontWeight={'medium'}>
												Message Section
											</Text>
											<Text className='text-gray-700 dark:text-white' size={'m'}>
												Write a message or select from a template
											</Text>
											<Flex gap={3} alignItems={'center'}>
												<Select
													className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
													border={'none'}
													rounded={'md'}
													onChange={(e) => {
														setError((prev) => ({
															...prev,
															message: '',
														}));
														dispatch(setMessage(e.target.value));
														setSelectedTemplate({
															id: e.target[e.target.selectedIndex].getAttribute('data-id') ?? '',
															name:
																e.target[e.target.selectedIndex].getAttribute('data-name') ?? '',
														});
													}}
												>
													<option
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
														value={''}
													>
														Select template!
													</option>
													{(templates ?? []).map(({ name, message, id }, index) => (
														<option
															className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
															value={message}
															key={index}
															data-id={id}
															data-name={name}
														>
															{name}
														</option>
													))}
												</Select>
												<HStack>
													<Button
														width={'200px'}
														colorScheme='green'
														aria-label='Add Template'
														rounded={'md'}
														isLoading={addingTemplate}
														leftIcon={<AddIcon />}
														onClick={() => {
															if (!details.message) return;
															openNameInput();
														}}
														fontSize={'sm'}
														px={4}
													>
														Add Template
													</Button>
													<IconButton
														aria-label='Edit'
														icon={<EditIcon />}
														color={'yellow.600'}
														isDisabled={!selectedTemplate.id}
														onClick={() =>
															updateTemplate(
																selectedTemplate.id,
																selectedTemplate.name,
																details.message
															)
														}
													/>
													<IconButton
														aria-label='Delete'
														icon={<MdDelete />}
														color={'red.400'}
														isDisabled={!selectedTemplate.id}
														onClick={() => removeTemplate(selectedTemplate.id)}
													/>
												</HStack>
											</Flex>
										</Box>
										<FormControl isInvalid={!!error.message}>
											<Textarea
												ref={messageRef}
												width={'full'}
												minHeight={'80px'}
												size={'sm'}
												rounded={'md'}
												placeholder={
													details.type === 'CSV'
														? 'Type your message here. \nex. Hello {{name}}, you are invited to join fanfest on {{date}}'
														: 'Type your message here. \nex. You are invited to join fanfest'
												}
												border={'none'}
												className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
												_placeholder={{
													opacity: 0.4,
													color: 'inherit',
												}}
												_focus={{ border: 'none', outline: 'none' }}
												value={details.message ?? ''}
												onChange={(e) => {
													setError((prev) => ({
														...prev,
														message: '',
													}));
													dispatch(setMessage(e.target.value));
												}}
											/>
											{error.message && <FormErrorMessage>{error.message}</FormErrorMessage>}
										</FormControl>

										<Box hidden={details.type !== 'CSV'}>
											<Text
												className='text-gray-700 dark:text-white'
												hidden={details.variables.length === 0}
											>
												Variables
											</Text>
											<Box>
												<Variables
													data={details.variables}
													onVariableSelect={insertVariablesToMessage}
												/>
											</Box>
										</Box>
										{/* --------------------------------ATTACHMENT, CONTACT & POLL INPUT SECTION--------------- */}
										<HStack>
											<Box flex={1}>
												<Text className='text-gray-700 dark:text-gray-400'>Attachments</Text>
												<Button
													width={'full'}
													variant={'outline'}
													colorScheme='green'
													onClick={() => {
														attachmentRef.current?.open(details.attachments);
													}}
												>
													Select Attachment ({details.attachments.length})
												</Button>
											</Box>
											<Box flex={1}>
												<Text className='text-gray-700 dark:text-gray-400'>Share Contact</Text>
												<Button
													width={'full'}
													variant={'outline'}
													colorScheme='green'
													onClick={() => {
														contactRef.current?.open(details.shared_contact_cards);
													}}
												>
													Select Contact ({details.shared_contact_cards.length})
												</Button>
											</Box>
										</HStack>
										<Box flex={1}>
											<Text className='text-gray-700 dark:text-gray-400'>Create Polls</Text>
											<Button
												width={'full'}
												variant={'outline'}
												colorScheme='green'
												onClick={() => {
													pollInputRef.current?.open(
														details.polls.length === 0 ? DEFAULT_POLL : details.polls
													);
												}}
											>
												Add Polls ({details.polls.length}) added
											</Button>
										</Box>
									</Flex>
									{/* ----------------------MESSAGE DELAY INPUT SECTION---------------- */}
									<FormControl flex={1} display={'flex'} flexDirection={'column'} gap={2}>
										<Box justifyContent={'space-between'}>
											<Text className='text-gray-700 dark:text-white' fontWeight={'medium'} py={4}>
												Message Delay
											</Text>
											<Flex gap={2}>
												<FormControl isInvalid={!!error.minDelay} flexGrow={1}>
													<Text fontSize='sm' className='text-gray-700 dark:text-white'>
														Minimum Delay (in sec)
													</Text>
													<Input
														width={'full'}
														placeholder='5'
														rounded={'md'}
														border={'none'}
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
														_focus={{
															border: 'none',
															outline: 'none',
														}}
														type='number'
														min={1}
														value={details.min_delay.toString()}
														onChange={(e) => {
															setError((prev) => ({
																...prev,
																minDelay: '',
															}));
															dispatch(setMinDelay(Number(e.target.value)));
														}}
													/>
													{error.minDelay && <FormErrorMessage>{error.minDelay}</FormErrorMessage>}
												</FormControl>
												<FormControl isInvalid={!!error.maxDelay} flexGrow={1}>
													<Text fontSize='sm' className='text-gray-700 dark:text-white'>
														Maximum Delay (in sec)
													</Text>
													<Input
														width={'full'}
														placeholder='55'
														rounded={'md'}
														border={'none'}
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
														_focus={{
															border: 'none',
															outline: 'none',
														}}
														type='number'
														min={1}
														value={details.max_delay.toString()}
														onChange={(e) => {
															setError((prev) => ({
																...prev,
																maxDelay: '',
															}));
															dispatch(setMaxDelay(Number(e.target.value)));
														}}
													/>
													{error.maxDelay && <FormErrorMessage>{error.maxDelay}</FormErrorMessage>}
												</FormControl>
											</Flex>
										</Box>

										<Box justifyContent={'space-between'}>
											<Text
												className='text-gray-700 dark:text-white'
												fontWeight={'medium'}
												pt={4}
												pb={2}
											>
												Batch Setting
											</Text>
											<Flex gap={2}>
												<FormControl isInvalid={!!error.batchSize} flexGrow={1}>
													<Text fontSize='sm' className='text-gray-700 dark:text-white'>
														Batch Size
													</Text>
													<Input
														width={'full'}
														placeholder='5'
														rounded={'md'}
														border={'none'}
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
														_focus={{
															border: 'none',
															outline: 'none',
														}}
														type='number'
														min={1}
														value={details.batch_size.toString()}
														onChange={(e) => {
															setError((prev) => ({
																...prev,
																batchSize: '',
															}));
															dispatch(setBatchSize(Number(e.target.value)));
														}}
													/>
													{error.batchSize && (
														<FormErrorMessage>{error.batchSize}</FormErrorMessage>
													)}
												</FormControl>
												<FormControl isInvalid={!!error.batchDelay} flexGrow={1}>
													<Text fontSize='sm' className='text-gray-700 dark:text-white'>
														Batch Delay (in sec)
													</Text>
													<Input
														width={'full'}
														placeholder='55'
														rounded={'md'}
														border={'none'}
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
														_focus={{
															border: 'none',
															outline: 'none',
														}}
														type='number'
														min={1}
														value={details.batch_delay.toString()}
														onChange={(e) => {
															setError((prev) => ({
																...prev,
																batchDelay: '',
															}));
															dispatch(setBatchDelay(Number(e.target.value)));
														}}
													/>
													{error.batchDelay && (
														<FormErrorMessage>{error.batchDelay}</FormErrorMessage>
													)}
												</FormControl>
											</Flex>
										</Box>

										<Box justifyContent={'space-between'}>
											<Text
												className='text-gray-700 dark:text-white'
												fontWeight={'medium'}
												pt={4}
												pb={2}
											>
												Schedule Setting
											</Text>
											<Flex gap={2}>
												<Box flexGrow={1}>
													<Text fontSize='sm' className='text-gray-700 dark:text-white'>
														Start Date
													</Text>
													<Input
														type='date'
														width={'full'}
														placeholder='00:00'
														rounded={'md'}
														border={'none'}
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
														_focus={{
															border: 'none',
															outline: 'none',
														}}
														value={details.startDate}
														onChange={(e) => dispatch(setStateDate(e.target.value))}
													/>
												</Box>
												<Box flexGrow={1}>
													<Text fontSize='sm' className='text-gray-700 dark:text-white'>
														Start At (in IST)
													</Text>
													<Input
														type='time'
														width={'full'}
														placeholder='00:00'
														rounded={'md'}
														border={'none'}
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
														_focus={{
															border: 'none',
															outline: 'none',
														}}
														value={details.startTime}
														onChange={(e) => dispatch(setStartTime(e.target.value))}
													/>
												</Box>
												<Box flexGrow={1}>
													<Text fontSize='sm' className='text-gray-700 dark:text-white'>
														End At (in IST)
													</Text>
													<Input
														type='time'
														width={'full'}
														placeholder='23:59'
														rounded={'md'}
														border={'none'}
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
														_focus={{
															border: 'none',
															outline: 'none',
														}}
														value={details.endTime}
														onChange={(e) => dispatch(setEndTime(e.target.value))}
													/>
												</Box>
											</Flex>
										</Box>
									</FormControl>
								</HStack>
								{/* ---------------------------SCHEDULE BUTTON SECTION---------------------- */}
								{error.apiError && (
									<Text pt={4} color={'tomato'}>
										{error.apiError}
									</Text>
								)}
								<Button
									colorScheme='green'
									variant='solid'
									width='full'
									mt={8}
									onClick={scheduleMessage}
									isLoading={uiDetails.schedulingMessages}
								>
									Schedule
								</Button>
								<SuccessDialog isOpen={successCampaignCreation} onClose={closeCampaignCreation} />
							</Box>
						</Flex>
						<SubscriptionAlert />
						<AttachmentSelectorDialog
							ref={attachmentRef}
							onConfirm={(ids) => dispatch(setAttachments(ids))}
						/>
						<ContactSelectorDialog
							ref={contactRef}
							onConfirm={(ids) => dispatch(setContactCards(ids))}
						/>
						<PollInputDialog ref={pollInputRef} onConfirm={(polls) => dispatch(setPolls(polls))} />
						<TemplateNameInputDialog
							isOpen={isNameInputOpen}
							onClose={closeNameInput}
							onConfirm={(name) => {
								if (!details.message) return;
								addToTemplate(name, details.message);
								closeNameInput();
							}}
						/>
						<NumberInputDialog isOpen={isNumberInputOpen} onClose={closeNumberInput} />
					</TabPanel>
					{/* ---------------------------Message Section------------------------------ */}
					<TabPanel>
						<Flex direction={'column'} width={'full'}>
							<Heading
								color={theme === 'dark' ? 'white' : 'GrayText'}
								fontSize={'large'}
								fontWeight={'medium'}
							>
								Message Details
							</Heading>
							<HStack alignItems={'flex-start'}>
								<FormControl mt={'1rem'} isInvalid={!!error.campaignName}>
									<FormLabel>Title</FormLabel>
									<Input
										placeholder='Message Name'
										type='text'
										value={details.campaign_name}
										onChange={(e) => dispatch(setCampaignName(e.target.value))}
									/>
									<FormErrorMessage>{error.campaignName}</FormErrorMessage>
								</FormControl>
								<FormControl mt={'1rem'} isInvalid={!!error.recipients}>
									<FormLabel>Select CSV</FormLabel>
									<Select
										className='!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white '
										border={'none'}
										value={details.csv_file}
										onChange={(e) => {
											setError((prev) => ({
												...prev,
												recipients: '',
											}));
											dispatch(setCSVFile(e.target.value));
											const recipient = recipients.find(
												(recipient) => recipient.id === e.target.value
											);
											if (!recipient || !recipient.headers) return;
											const headers = recipient.headers.map((item) => `{{${item}}}`);
											if (recipient) dispatch(setVariables(headers));
										}}
									>
										<option
											value={'select'}
											className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
										>
											Select one!
										</option>
										{csvListWithDate.map(({ id, name }) => (
											<option
												className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
												value={id}
												key={id}
											>
												{name}
											</option>
										))}
									</Select>
								</FormControl>
							</HStack>
							<HStack alignItems={'flex-start'}>
								<FormControl flex={1}>
									<Box justifyContent={'space-between'}>
										<Text className='text-gray-700 dark:text-white' py={2} fontWeight={'medium'}>
											Message Section
										</Text>
										<Text className='text-gray-700 dark:text-white' size={'m'}>
											Write a message or select from a template
										</Text>
										<Flex gap={3} alignItems={'center'} pb={4}>
											<Select
												className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
												border={'none'}
												rounded={'md'}
												onChange={(e) => {
													setError((prev) => ({
														...prev,
														message: '',
													}));
													dispatch(setMessage(e.target.value));
													setSelectedTemplate({
														id: e.target[e.target.selectedIndex].getAttribute('data-id') ?? '',
														name: e.target[e.target.selectedIndex].getAttribute('data-name') ?? '',
													});
												}}
											>
												<option
													className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
													value={''}
												>
													Select template!
												</option>
												{(templates ?? []).map(({ name, message, id }, index) => (
													<option
														className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
														value={message}
														key={index}
														data-id={id}
														data-name={name}
													>
														{name}
													</option>
												))}
											</Select>
											<HStack>
												<Button
													width={'200px'}
													colorScheme='green'
													aria-label='Add Template'
													rounded={'md'}
													isLoading={addingTemplate}
													leftIcon={<AddIcon />}
													onClick={() => {
														if (!details.message) return;
														openNameInput();
													}}
													fontSize={'sm'}
													px={4}
												>
													Add Template
												</Button>
												<IconButton
													aria-label='Edit'
													icon={<EditIcon />}
													color={'yellow.600'}
													isDisabled={!selectedTemplate.id}
													onClick={() =>
														updateTemplate(
															selectedTemplate.id,
															selectedTemplate.name,
															details.message
														)
													}
												/>
												<IconButton
													aria-label='Delete'
													icon={<MdDelete />}
													color={'red.400'}
													isDisabled={!selectedTemplate.id}
													onClick={() => removeTemplate(selectedTemplate.id)}
												/>
											</HStack>
										</Flex>
									</Box>
									<FormControl isInvalid={!!error.message}>
										<Textarea
											ref={messageRef}
											width={'full'}
											minHeight={'80px'}
											size={'sm'}
											rounded={'md'}
											placeholder={
												details.type === 'CSV'
													? 'Type your message here. \nex. Hello {{name}}, you are invited to join fanfest on {{date}}'
													: 'Type your message here. \nex. You are invited to join fanfest'
											}
											border={'none'}
											className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
											_placeholder={{
												opacity: 0.4,
												color: 'inherit',
											}}
											_focus={{ border: 'none', outline: 'none' }}
											value={details.message ?? ''}
											onChange={(e) => {
												setError((prev) => ({
													...prev,
													message: '',
												}));
												dispatch(setMessage(e.target.value));
											}}
										/>
										{error.message && <FormErrorMessage>{error.message}</FormErrorMessage>}
									</FormControl>

									<Box hidden={details.type !== 'CSV'}>
										<Text
											className='text-gray-700 dark:text-white'
											hidden={details.variables.length === 0}
										>
											Variables
										</Text>
										<Box>
											<Variables
												data={details.variables}
												onVariableSelect={insertVariablesToMessage}
											/>
										</Box>
									</Box>
								</FormControl>
								<VStack flex={1}>
									<Text
										width={'full'}
										className='text-gray-700 dark:text-white'
										py={2}
										fontWeight={'medium'}
										textAlign={'left'}
									>
										Timing Section
									</Text>
									<Box width={'full'} mt={2}>
										<Text fontSize='sm' className='text-gray-700 dark:text-white'>
											Start At (in IST)
										</Text>
										<Input
											type='time'
											width={'full'}
											placeholder='00:00'
											rounded={'md'}
											border={'none'}
											className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
											_focus={{
												border: 'none',
												outline: 'none',
											}}
											value={details.startTime}
											onChange={(e) => dispatch(setStartTime(e.target.value))}
										/>
									</Box>
									<Box width={'full'} mt={2}>
										<Text fontSize='sm' className='text-gray-700 dark:text-white'>
											End At (in IST)
										</Text>
										<Input
											type='time'
											width={'full'}
											placeholder='00:00'
											rounded={'md'}
											border={'none'}
											className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
											_focus={{
												border: 'none',
												outline: 'none',
											}}
											value={details.endTime}
											onChange={(e) => dispatch(setEndTime(e.target.value))}
										/>
									</Box>
								</VStack>
							</HStack>
							<HStack mt={'1rem'} width={'full'} alignItems={'stretch'}>
								<Box flex={1}>
									<Text className='text-gray-700 dark:text-gray-400'>Attachments</Text>
									<Button
										width={'full'}
										variant={'outline'}
										colorScheme='green'
										onClick={() => {
											attachmentRef.current?.open(details.attachments);
										}}
									>
										Select Attachment ({details.attachments.length})
									</Button>
								</Box>
								<Box flex={1}>
									<Text className='text-gray-700 dark:text-gray-400'>Share Contact</Text>
									<Button
										width={'full'}
										variant={'outline'}
										colorScheme='green'
										onClick={() => {
											contactRef.current?.open(details.shared_contact_cards);
										}}
									>
										Select Contact ({details.shared_contact_cards.length})
									</Button>
								</Box>
								<Box flex={1}>
									<Text className='text-gray-700 dark:text-gray-400'>Create Polls</Text>
									<Button
										width={'full'}
										variant={'outline'}
										colorScheme='green'
										onClick={() => {
											pollInputRef.current?.open(
												details.polls.length === 0 ? DEFAULT_POLL : details.polls
											);
										}}
									>
										Add Polls ({details.polls.length}) added
									</Button>
								</Box>
							</HStack>
							<Center mt={'1rem'} gap={'0.5rem'} alignItems={'center'}>
								<InfoOutlineIcon color={'gray'} />
								<Text>Message will be Scheduled at Mid-Night</Text>
							</Center>
							<Button
								mt={'1rem'}
								colorScheme='green'
								isLoading={uiDetails.schedulingMessages}
								onClick={handleScheduleMessage}
							>
								Schedule Message
							</Button>
							<Divider width={'full'} my={'2rem'} />
							<Heading
								color={theme === 'dark' ? 'white' : 'GrayText'}
								fontSize={'large'}
								fontWeight={'medium'}
							>
								All Schedulers
							</Heading>
							<MessageSchedulerList />
						</Flex>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Flex>
	);
}

const SuccessDialog = ({ isOpen, onClose }: { onClose: () => void; isOpen: boolean }) => {
	const cancelRef = useRef<any>();
	return (
		<AlertDialog
			motionPreset='slideInBottom'
			leastDestructiveRef={cancelRef}
			onClose={onClose}
			isOpen={isOpen}
			isCentered
			size={'sm'}
		>
			<AlertDialogOverlay />

			<AlertDialogContent width={'80%'}>
				<AlertDialogHeader>
					<Text size={'2xl'} textAlign={'center'}>
						Successfully created campaign.
					</Text>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button
						bgColor={'green.300'}
						_hover={{
							bgColor: 'green.400',
						}}
						width={'100%'}
						onClick={onClose}
					>
						<Text color={'white'}>OK</Text>
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
