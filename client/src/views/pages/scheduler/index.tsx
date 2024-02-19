import { InfoOutlineIcon } from '@chakra-ui/icons';
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
	FormLabel,
	HStack,
	Heading,
	Input,
	Select,
	Tab,
	TabList,
	TabPanel,
	TabPanels,
	Tabs,
	Text,
	VStack,
	useDisclosure,
} from '@chakra-ui/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MdCampaign } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import MessageService from '../../../services/message.service';
import { StoreNames, StoreState } from '../../../store';
import {
	addScheduler,
	reset,
	setAPIError,
	setAttachments,
	setBatchDelay,
	setBatchSize,
	setCSVFile,
	setCampaignName,
	setCampaignNameError,
	setContactCards,
	setEndTime,
	setMessageError,
	setMinDelay,
	setPolls,
	setRecipients,
	setRecipientsError,
	setRecipientsFrom,
	setStartTime,
	setStateDate,
	setVariables,
} from '../../../store/reducers/SchedulerReducer';
import AddOns from '../../components/add-ons';
import SubscriptionAlert, { SubscriptionPopup } from '../../components/subscription-alert';
import { MessageInputSection, MessageSchedulerList } from './components';
import CampaignDetailsSection from './components/campaign-details-section';

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

export default function Scheduler() {
	const dispatch = useDispatch();
	const theme = useTheme();

	const {
		isOpen: successCampaignCreation,
		onOpen: openCampaignCreation,
		onClose: closeCampaignCreation,
	} = useDisclosure();

	const [uiDetails, setUIDetails] = useState<{
		uploadingCSV: boolean;
		deletingCSV: boolean;
		recipientsLoading: boolean;
		loadingVerifiedContacts: boolean;
		schedulingMessages: boolean;
	}>({
		uploadingCSV: false,
		deletingCSV: false,
		recipientsLoading: false,
		loadingVerifiedContacts: false,
		schedulingMessages: false,
	});

	const {
		details,
		recipients,
		all_schedulers,
		ui: { apiError, campaignNameError, recipientsError },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const { canSendMessage, groups, labels } = useSelector(
		(state: StoreState) => state[StoreNames.USER]
	);
	const { list: csvList } = useSelector((state: StoreState) => state[StoreNames.CSV]);
	const csvListWithDate = csvList.filter(
		(item) =>
			item.headers.includes('number') &&
			item.headers.includes('date') &&
			item.headers.includes('month')
	);

	// const [error, setError] = useState({
	// 	campaignName: '',
	// 	minDelay: '',
	// 	maxDelay: '',
	// 	startTime: '',
	// 	endTime: '',
	// 	batchDelay: '',
	// 	batchSize: '',
	// 	recipients: '',
	// 	apiError: '',
	// });

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

	const validate = () => {
		let hasError = false;
		if (!details.campaign_name) {
			dispatch(setCampaignNameError(true));
			hasError = true;
		}

		if (details.type === 'CSV' && details.csv_file === '') {
			dispatch(setRecipientsError(true));
			hasError = true;
		}
		if (details.type === 'GROUP' && details.group_ids.length === 0) {
			dispatch(setRecipientsError(true));
			hasError = true;
		}
		if (details.type === 'GROUP_INDIVIDUAL' && details.group_ids.length === 0) {
			dispatch(setRecipientsError(true));
			hasError = true;
		}
		if (details.type === 'LABEL' && details.label_ids.length === 0) {
			dispatch(setRecipientsError(true));
			hasError = true;
		}
		if (
			!details.message &&
			details.attachments.length === 0 &&
			details.shared_contact_cards.length === 0 &&
			details.polls.length === 0
		) {
			dispatch(setMessageError(true));
			hasError = true;
		}
		return !hasError;
	};

	const scheduleMessage = () => {
		if (!validate()) {
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
				dispatch(setAPIError(errorMessage));
				setTimeout(() => {
					dispatch(setAPIError(''));
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
		if (!validate()) {
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
								<CampaignDetailsSection fetchRecipients={fetchRecipients} />

								<HStack gap={8} alignItems={'start'}>
									<Box marginTop={'0.5rem'} paddingTop={2} flex={1}>
										<MessageInputSection />
									</Box>
									{/* ----------------------MESSAGE DELAY INPUT SECTION---------------- */}
									<Flex flex={1} flexDirection={'column'} gap={3}>
										<Text
											className='text-gray-700 dark:text-white'
											fontWeight={'medium'}
											marginTop={'1rem'}
										>
											Message Delay
										</Text>
										<Flex gap={4}>
											<DelayInput
												placeholder='Min Delay (in sec)'
												value={details.min_delay}
												onChange={(num) => dispatch(setMinDelay(num))}
											/>
											<DelayInput
												placeholder='Min Delay (in sec)'
												value={details.min_delay}
												onChange={(num) => dispatch(setMinDelay(num))}
											/>
											<DelayInput
												placeholder='Batch Size'
												value={details.batch_size}
												onChange={(num) => dispatch(setBatchSize(num))}
											/>
											<DelayInput
												placeholder='Batch Delay'
												value={details.batch_delay}
												onChange={(num) => dispatch(setBatchDelay(num))}
											/>
										</Flex>

										<Flex gap={2}>
											<FormControl flexGrow={1}>
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
											</FormControl>
											<TimeInput
												placeholder='Start At (in IST)'
												onChange={(text) => dispatch(setStartTime(text))}
												value={details.startTime}
											/>
											<TimeInput
												placeholder='End At (in IST)'
												onChange={(text) => dispatch(setEndTime(text))}
												value={details.endTime}
											/>
										</Flex>
										<AddOns
											marginTop={'0.5rem'}
											{...details}
											onAttachmentsSelected={(ids) => dispatch(setAttachments(ids))}
											onContactsSelected={(ids) => dispatch(setContactCards(ids))}
											onPollsSelected={(polls) => dispatch(setPolls(polls))}
										/>
									</Flex>
								</HStack>
								{/* ---------------------------SCHEDULE BUTTON SECTION---------------------- */}
								{!!apiError && (
									<Text pt={4} color={'tomato'}>
										{apiError}
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
							<Flex gap='2rem' marginTop={'1rem'}>
								<VStack alignItems={'flex-start'} flex={1} gap={'0.5rem'}>
									<FormControl isInvalid={campaignNameError}>
										<FormLabel>Title</FormLabel>
										<Input
											placeholder='Message Name'
											type='text'
											value={details.campaign_name}
											onChange={(e) => dispatch(setCampaignName(e.target.value))}
										/>
									</FormControl>
									<FormControl isInvalid={recipientsError}>
										<FormLabel>Select CSV</FormLabel>
										<Select
											className='!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white '
											border={'none'}
											value={details.csv_file}
											onChange={(e) => {
												dispatch(setRecipientsError(false));
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

									<Text
										width={'full'}
										className='text-gray-700 dark:text-white'
										fontWeight={'medium'}
										textAlign={'left'}
									>
										Timing Section
									</Text>
									<Flex gap={2} width={'full'}>
										<TimeInput
											placeholder='Start At (in IST)'
											onChange={(text) => dispatch(setStartTime(text))}
											value={details.startTime}
										/>
										<TimeInput
											placeholder='End At (in IST)'
											onChange={(text) => dispatch(setEndTime(text))}
											value={details.endTime}
										/>
									</Flex>
									<AddOns
										width={'full'}
										{...details}
										onAttachmentsSelected={(ids) => dispatch(setAttachments(ids))}
										onContactsSelected={(ids) => dispatch(setContactCards(ids))}
										onPollsSelected={(polls) => dispatch(setPolls(polls))}
									/>
									<Button
										width={'full'}
										colorScheme='green'
										isLoading={uiDetails.schedulingMessages}
										onClick={handleScheduleMessage}
									>
										Schedule Message
									</Button>
								</VStack>
								<MessageInputSection
									textAreaProps={{
										minHeight: '245px',
									}}
								/>
							</Flex>

							<Center mt={'1rem'} gap={'0.5rem'} alignItems={'center'}>
								<InfoOutlineIcon color={'gray'} />
								<Text>Message will be Scheduled at Mid-Night</Text>
							</Center>

							<Divider width={'full'} my={'1rem'} />
							{all_schedulers.length < 1 ? null : (
								<>
									<Heading
										color={theme === 'dark' ? 'white' : 'GrayText'}
										fontSize={'large'}
										fontWeight={'medium'}
										textAlign={'center'}
									>
										All Schedulers
									</Heading>
									<MessageSchedulerList />
								</>
							)}
						</Flex>
					</TabPanel>
				</TabPanels>
			</Tabs>
		</Flex>
	);
}

const SuccessDialog = ({ isOpen, onClose }: { onClose: () => void; isOpen: boolean }) => {
	const cancelRef = useRef(null);
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

function DelayInput({
	onChange,
	placeholder,
	value,
}: {
	placeholder: string;
	value: number;
	onChange: (num: number) => void;
}) {
	return (
		<FormControl flexGrow={1}>
			<Text fontSize='sm' className='text-gray-700 dark:text-white'>
				{placeholder}
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
				value={value.toString()}
				onChange={(e) => onChange(Number(e.target.value))}
			/>
		</FormControl>
	);
}

function TimeInput({
	onChange,
	placeholder,
	value,
}: {
	placeholder: string;
	value: string;
	onChange: (text: string) => void;
}) {
	return (
		<FormControl flexGrow={1}>
			<Text fontSize='sm' className='text-gray-700 dark:text-white'>
				{placeholder}
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
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</FormControl>
	);
}
