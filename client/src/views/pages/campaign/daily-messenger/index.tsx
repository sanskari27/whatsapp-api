import {
	Box,
	Button,
	Flex,
	HStack,
	Heading,
	IconButton,
	Text,
	VStack,
	useToast,
} from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { BiReset } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import MessageService from '../../../../services/message.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	reset,
	setBatchDelayError,
	setBatchSizeError,
	setCampaignNameError,
	setEndTime,
	setMaxDelayError,
	setMessageError,
	setMinDelayError,
	setRecipients,
	setRecipientsError,
	setSelectedScheduler,
	setStartTime,
} from '../../../../store/reducers/SchedulerReducer';
import { TimeInput } from '../components/inputs.component';
import MessageContent from '../components/message-content.component';
import CampaignDetails from './campaign-details.component';

export default function DailyMessenger() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const toast = useToast();
	const { id } = useParams();
	const {
		details,
		ui: { apiError },
	} = useSelector((state: StoreState) => state[StoreNames.SCHEDULER]);

	const { groups, labels } = useSelector((state: StoreState) => state[StoreNames.USER]);
	const { list: csvList } = useSelector((state: StoreState) => state[StoreNames.CSV]);

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

	useEffect(() => {
		fetchRecipients(details.type);
	}, [fetchRecipients, details.type]);

	const validate = () => {
		let hasError = false;
		if (!details.campaign_name) {
			dispatch(setCampaignNameError(true));
			hasError = true;
		}

		if (details.type === 'NUMBERS' && details.numbers?.length === 0) {
			dispatch(setRecipientsError(true));
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
		if (details.min_delay < 1) {
			dispatch(setMinDelayError(true));
			hasError = true;
		}
		if (details.max_delay < 1) {
			dispatch(setMaxDelayError(true));
			hasError = true;
		}
		if (details.batch_size < 1) {
			dispatch(setBatchSizeError(true));
			hasError = true;
		}
		if (details.batch_delay < 1) {
			dispatch(setBatchDelayError(true));
			hasError = true;
		}
		return !hasError;
	};

	const scheduleMessage = () => {
		if (!validate()) {
			return;
		}
		MessageService.scheduleCampaign(details).then(() => {
			dispatch(reset());
			toast({
				title: 'Campaign scheduler.',
				description: 'Campaign is being Scheduled',
				status: 'info',
				duration: 3000,
				isClosable: true,
			});
		});
	};

	useEffect(() => {
		dispatch(reset());
		if (!id) {
			return;
		}
		dispatch(setSelectedScheduler(id));
	}, [id, dispatch]);

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>Setup a daily messenger</Heading>

			<Flex direction={'column'} marginTop={'1rem'} gap='2rem' maxWidth={'800px'}>
				<CampaignDetails fetchRecipients={fetchRecipients} csv_only />
				<MessageContent />
				<Box>
					<Heading fontSize={'lg'} color={Colors.PRIMARY_DARK}>
						Schedule
					</Heading>

					<Flex gap={2} marginTop={'0.5rem'}>
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
				</Box>
				<VStack gap={'0.5rem'}>
					{!!apiError && (
						<Text color={'tomato'} textAlign={'center'}>
							{apiError}
						</Text>
					)}
					<HStack width={'full'}>
						<Button colorScheme='green' variant='solid' width='full' onClick={scheduleMessage}>
							Save
						</Button>
						<IconButton
							aria-label='Edit'
							icon={<BiReset />}
							color={'gray'}
							onClick={() => {
								if (id) {
									navigate(NAVIGATION.CAMPAIGNS + NAVIGATION.DAILY_MESSENGER);
								} else {
									dispatch(reset());
								}
							}}
						/>
					</HStack>
				</VStack>
			</Flex>
		</Flex>
	);
}
