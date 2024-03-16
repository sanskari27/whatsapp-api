import {
	Box,
	Button,
	Flex,
	FormControl,
	Heading,
	Input,
	Text,
	VStack,
	useToast,
} from '@chakra-ui/react';
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../../config/const';
import MessageService from '../../../../services/message.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	reset,
	setBatchDelay,
	setBatchDelayError,
	setBatchSize,
	setBatchSizeError,
	setCampaignNameError,
	setEndTime,
	setMaxDelay,
	setMaxDelayError,
	setMessageError,
	setMinDelay,
	setMinDelayError,
	setRecipients,
	setRecipientsError,
	setStartTime,
	setStateDate,
} from '../../../../store/reducers/SchedulerReducer';
import SubscriptionPopup from '../../../components/subscription-alert';
import { DelayInput, TimeInput } from '../components/inputs.component';
import MessageContent from '../components/message-content.component';
import CampaignDetails from './campaign-details.component';

export default function BulkMessaging() {
	const dispatch = useDispatch();
	const toast = useToast();
	const {
		details,
		ui: { apiError, minDelayError, maxDelayError, batchDelayError, batchSizeError },
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
		if (details.devices.length === 0) {
			toast({
				title: 'Select 1 Profile.',
				status: 'error',
			});
			hasError = true;
		}
		if (!details.name) {
			dispatch(setCampaignNameError(true));
			hasError = true;
		}

		if (details.type === 'NUMBERS' && details.numbers?.length === 0) {
			dispatch(setRecipientsError(true));
			hasError = true;
		}
		if (details.type === 'CSV' && details.csv === '') {
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
			details.contacts.length === 0 &&
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

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>Create a new campaign</Heading>
			<SubscriptionPopup />

			<Flex direction={'column'} marginTop={'1rem'} gap='3rem' maxWidth={'800px'}>
				<CampaignDetails fetchRecipients={fetchRecipients} />
				<MessageContent />

				<Box>
					<Heading fontSize={'lg'} color={Colors.PRIMARY_DARK}>
						Schedule
					</Heading>
					<Flex gap={4} marginTop={'1rem'}>
						<DelayInput
							placeholder='Min Delay (in sec)'
							value={details.min_delay}
							onChange={(num) => dispatch(setMinDelay(num))}
							invalid={minDelayError}
						/>
						<DelayInput
							placeholder='Max Delay (in sec)'
							value={details.max_delay}
							onChange={(num) => dispatch(setMaxDelay(num))}
							invalid={maxDelayError}
						/>
						<DelayInput
							placeholder='Batch Size'
							value={details.batch_size}
							onChange={(num) => dispatch(setBatchSize(num))}
							invalid={batchSizeError}
						/>
						<DelayInput
							placeholder='Batch Delay'
							value={details.batch_delay}
							onChange={(num) => dispatch(setBatchDelay(num))}
							invalid={batchDelayError}
						/>
					</Flex>
					<Flex gap={2} marginTop={'0.5rem'}>
						<FormControl flexGrow={1}>
							<Text fontSize='sm' color={Colors.PRIMARY_DARK}>
								Start Date
							</Text>
							<Input
								type='date'
								width={'full'}
								placeholder='00:00'
								rounded={'md'}
								border={'none'}
								bgColor={Colors.ACCENT_LIGHT}
								color={Colors.ACCENT_DARK}
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
				</Box>
				<VStack gap={'0.5rem'}>
					{!!apiError && (
						<Text color={'tomato'} textAlign={'center'}>
							{apiError}
						</Text>
					)}
					<Button colorScheme='green' variant='solid' width='full' onClick={scheduleMessage}>
						Schedule
					</Button>
				</VStack>
			</Flex>
		</Flex>
	);
}
