import {
	AbsoluteCenter,
	Box,
	Button,
	Divider,
	Flex,
	FormControl,
	FormErrorMessage,
	HStack,
	Heading,
	IconButton,
	Input,
	Text,
	VStack,
	useToast,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { BiReset } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import BotService from '../../../../services/bot.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addBot,
	reset,
	setEndAt,
	setError,
	setForwardMessage,
	setForwardTo,
	setResponseDelayTime,
	setResponseDelayType,
	setSelectedBot,
	setStartAt,
	setTriggerGapTime,
	setTriggerGapType,
	updateBot,
} from '../../../../store/reducers/BotReducers';
import Info from '../../../components/info';
import SubscriptionPopup from '../../../components/subscription-alert';
import { NumberInput, SelectElement, TextAreaElement, TextInput } from './inputs.components';
import MessageContent from './message-content.component';
import CampaignDetails from './responder-details.component';

export default function AutoResponder() {
	const dispatch = useDispatch();
	const toast = useToast();
	const navigate = useNavigate();
	const { id } = useParams();

	const { details, trigger_gap, response_delay, ui, all_bots } = useSelector(
		(state: StoreState) => state[StoreNames.CHATBOT]
	);
	const {
		trigger,
		message,
		options,
		respond_to,
		shared_contact_cards,
		attachments,
		response_delay_seconds,
		trigger_gap_seconds,
		forward,
	} = details;
	const { isEditingBot } = ui;

	useEffect(() => {
		dispatch(reset());
		if (!id) {
			return;
		}
		dispatch(setSelectedBot(id));
	}, [id, dispatch]);

	function validate() {
		const errorPayload: {
			type:
				| 'triggerError'
				| 'messageError'
				| 'respondToError'
				| 'optionsError'
				| 'contactCardsError'
				| 'attachmentError'
				| 'triggerGapError'
				| 'responseGapError';
			error: string;
		} = {
			type: 'triggerError',
			error: '',
		};

		let notHasError = true;

		const haveSameTrigger = all_bots.some((bot) => {
			if (bot.trigger !== trigger) {
				return false;
			}
			return bot.bot_id !== details.bot_id;
		});

		if (haveSameTrigger) {
			errorPayload.type = 'triggerError';
			errorPayload.error = 'Trigger already exists';
			dispatch(setError(errorPayload));
			notHasError = false;
		} else {
			errorPayload.type = 'triggerError';
			errorPayload.error = '';
			dispatch(setError(errorPayload));
		}

		if (
			!message &&
			attachments.length === 0 &&
			shared_contact_cards.length === 0 &&
			details.polls.length === 0
		) {
			errorPayload.type = 'messageError';
			errorPayload.error = 'Message or Attachment or Contact Card or Poll is required';
			dispatch(setError(errorPayload));
			notHasError = false;
		} else {
			errorPayload.type = 'messageError';
			errorPayload.error = '';
			dispatch(setError(errorPayload));
		}

		if (!respond_to) {
			errorPayload.type = 'respondToError';
			errorPayload.error = 'Recipients is required';
			dispatch(setError(errorPayload));
			notHasError = false;
		} else {
			errorPayload.type = 'respondToError';
			errorPayload.error = '';
			dispatch(setError(errorPayload));
		}

		if (!options) {
			errorPayload.type = 'optionsError';
			errorPayload.error = 'Conditions is required';
			dispatch(setError(errorPayload));
			notHasError = false;
		} else {
			errorPayload.type = 'optionsError';
			errorPayload.error = '';
			dispatch(setError(errorPayload));
		}

		if (response_delay_seconds <= 0) {
			errorPayload.type = 'responseGapError';
			errorPayload.error = 'Invalid Message Delay';
			dispatch(setError(errorPayload));
			notHasError = false;
		} else {
			errorPayload.type = 'responseGapError';
			errorPayload.error = '';
			dispatch(setError(errorPayload));
		}

		if (trigger_gap_seconds <= 0) {
			errorPayload.type = 'triggerGapError';
			errorPayload.error = 'Invalid Delay Gap';
			dispatch(setError(errorPayload));
			notHasError = false;
		} else {
			errorPayload.type = 'triggerGapError';
			errorPayload.error = '';
			dispatch(setError(errorPayload));
		}
		return notHasError;
	}

	async function handleSave() {
		if (!validate()) {
			return;
		}
		if (isEditingBot && !details.bot_id) return;
		const promise = isEditingBot
			? BotService.updateBot(details.bot_id, details)
			: BotService.createBot(details);

		toast.promise(promise, {
			success: (data) => {
				const acton = isEditingBot ? updateBot({ id: data.bot_id, data }) : addBot(data);
				dispatch(acton);
				dispatch(reset());
				return {
					title: 'Data saved successfully',
				};
			},
			error: {
				title: 'Error Saving Bot',
			},
			loading: { title: 'Saving Data', description: 'Please wait' },
		});
	}

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>Create new auto responder</Heading>
			<SubscriptionPopup />

			<Flex direction={'column'} marginTop={'1rem'} gap='3rem' maxWidth={'800px'}>
				<CampaignDetails />
				<MessageContent />

				{/*--------------------------------- GAP & DELAY SECTION--------------------------- */}
				<Flex width={'full'} direction={'column'} gap={'0.5rem'}>
					<Heading fontSize={'lg'} color={Colors.PRIMARY_DARK}>
						Schedule
					</Heading>
					<HStack alignItems={'start'}>
						<FormControl isInvalid={!!ui.triggerGapError} flex={1}>
							<Flex alignItems={'center'}>
								<Text className='text-gray-700 dark:text-gray-400'>Gap Delay</Text>
								<Info>Time Gap if same trigger is sent.</Info>
							</Flex>

							<HStack>
								<NumberInput
									value={trigger_gap.time}
									onChangeText={(text) => dispatch(setTriggerGapTime(Number(text)))}
								/>
								<SelectElement
									value={trigger_gap.type}
									onChangeText={(text) => dispatch(setTriggerGapType(text))}
									options={[
										{
											value: 'SEC',
											title: 'Second',
										},
										{
											value: 'MINUTE',
											title: 'Min',
										},
										{
											value: 'HOUR',
											title: 'Hour',
										},
									]}
								/>
							</HStack>
							{ui.triggerGapError && <FormErrorMessage>{ui.triggerGapError}</FormErrorMessage>}
						</FormControl>
						<FormControl isInvalid={!!ui.responseGapError} flex={1}>
							<Flex alignItems={'center'}>
								<Text className='text-gray-700 dark:text-gray-400'>Message Delay</Text>
								<Info>Time Delay between trigger and response.</Info>
							</Flex>
							<HStack>
								<NumberInput
									value={response_delay.time}
									onChangeText={(text) => dispatch(setResponseDelayTime(text))}
								/>
								<SelectElement
									value={response_delay.type}
									onChangeText={(text) => dispatch(setResponseDelayType(text))}
									options={[
										{
											value: 'SEC',
											title: 'Second',
										},
										{
											value: 'MINUTE',
											title: 'Min',
										},
										{
											value: 'HOUR',
											title: 'Hour',
										},
									]}
								/>
							</HStack>
							{ui.responseGapError && <FormErrorMessage>{ui.responseGapError}</FormErrorMessage>}
						</FormControl>
					</HStack>
					<HStack alignItems={'start'}>
						<Flex flex={1} gap={'0.5rem'}>
							<FormControl flex={1}>
								<Text color={Colors.PRIMARY_DARK}>Start At (in IST)</Text>
								<Input
									type='time'
									placeholder='00:00'
									rounded={'md'}
									border={'none'}
									color={Colors.ACCENT_DARK}
									bgColor={Colors.ACCENT_LIGHT}
									borderColor={Colors.ACCENT_DARK}
									borderWidth={'1px'}
									value={details.startAt}
									onChange={(e) => dispatch(setStartAt(e.target.value))}
								/>
							</FormControl>
							<FormControl flex={1}>
								<Text color={Colors.PRIMARY_DARK}>End At (in IST)</Text>
								<Input
									type='time'
									width={'full'}
									placeholder='23:59'
									rounded={'md'}
									border={'none'}
									color={Colors.ACCENT_DARK}
									bgColor={Colors.ACCENT_LIGHT}
									borderColor={Colors.ACCENT_DARK}
									borderWidth={'1px'}
									value={details.endAt}
									onChange={(e) => dispatch(setEndAt(e.target.value))}
								/>
							</FormControl>
						</Flex>
					</HStack>
				</Flex>

				{/*--------------------------------- FORWARD SECTION--------------------------- */}
				<Flex direction={'column'} gap={2} mt={'1rem'}>
					<Box position='relative'>
						<Divider height='2px' />
						<AbsoluteCenter color={'gray.500'}>Forward Leads</AbsoluteCenter>
					</Box>
					<Box flex={1} mt={'0.5rem'}>
						<Text color={Colors.PRIMARY_DARK}>Forward To (without +)</Text>
						<TextInput
							placeholder='ex 9175XXXXXX68'
							value={forward.number ?? ''}
							onChangeText={(text) => dispatch(setForwardTo(text))}
						/>
					</Box>

					<Box flex={1}>
						<Text className='text-gray-700 dark:text-gray-400'>Forward Message</Text>
						<TextAreaElement
							value={forward.message ?? ''}
							onChange={(e) => dispatch(setForwardMessage(e.target.value))}
							isInvalid={false}
							placeholder={'ex. Forwarded Lead'}
						/>
					</Box>
				</Flex>

				<VStack gap={'0.5rem'}>
					<HStack width={'full'}>
						<Button colorScheme='green' variant='solid' width='full' onClick={handleSave}>
							Save
						</Button>
						<IconButton
							aria-label='Edit'
							icon={<BiReset />}
							color={'gray'}
							onClick={() => {
								if (id) {
									navigate(NAVIGATION.CAMPAIGNS + NAVIGATION.AUTO_RESPONDER);
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
