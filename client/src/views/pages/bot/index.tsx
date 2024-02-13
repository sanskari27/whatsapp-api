import { CheckIcon } from '@chakra-ui/icons';
import {
	AbsoluteCenter,
	Box,
	Button,
	Divider,
	Flex,
	FormControl,
	FormErrorMessage,
	HStack,
	IconButton,
	Tag,
	TagLabel,
	Text,
	Textarea,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { RiRobot2Line } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { NAVIGATION } from '../../../config/const';
import { popFromNavbar, pushToNavbar } from '../../../hooks/useNavbar';
import { useTheme } from '../../../hooks/useTheme';
import BotService from '../../../services/bot.service';
import { StoreNames, StoreState } from '../../../store';
import {
	addBot,
	reset,
	setAddingBot,
	setAttachments,
	setContactCards,
	setError,
	setForwardMessage,
	setForwardTo,
	setMessage,
	setNurturing,
	setOptions,
	setPolls,
	setRespondTo,
	setResponseDelayTime,
	setResponseDelayType,
	setTrigger,
	setTriggerGapTime,
	setTriggerGapType,
	updateBot,
} from '../../../store/reducers/BotReducers';
import Info from '../../components/info';
import PollInputDialog, { PollInputDialogHandle } from '../../components/polls-input-dialog';
import AttachmentSelectorDialog, {
	AttachmentDialogHandle,
} from '../../components/selector-dialog/AttachmentSelectorDialog';
import ContactSelectorDialog, {
	ContactDialogHandle,
} from '../../components/selector-dialog/ContactSelectorDialog';
import SubscriptionAlert, { SubscriptionPopup } from '../../components/subscription-alert';
import AllResponders from './components/AllResponders';
import InputLeadsNurturingDialog, {
	InputLeadsNurturingDialogHandle,
} from './components/InputLeadsNurturingDialog';
import { NumberInput, SelectElement, TextAreaElement, TextInput } from './components/Inputs';

export default function Bot() {
	const dispatch = useDispatch();
	const attachmentSelectorRef = useRef<AttachmentDialogHandle>(null);
	const contactSelectorRef = useRef<ContactDialogHandle>(null);
	const pollInputRef = useRef<PollInputDialogHandle>(null);
	const leadsNurturingRef = useRef<InputLeadsNurturingDialogHandle>(null);
	const theme = useTheme();
	const messageRef = useRef<HTMLTextAreaElement>(null);

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
	const { isAddingBot, isEditingBot } = ui;

	const { canSendMessage } = useSelector((state: StoreState) => state[StoreNames.USER]);

	useEffect(() => {
		pushToNavbar({
			title: 'Auto Responder',
			icon: RiRobot2Line,
			link: NAVIGATION.BOT,
		});
		return () => {
			popFromNavbar();
		};
	}, []);

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
	const insertVariablesToMessage = (variable: string) => {
		dispatch(
			setMessage(
				details.message.substring(0, messageRef.current?.selectionStart) +
					' ' +
					variable +
					' ' +
					details.message.substring(messageRef.current?.selectionEnd ?? 0, details.message.length)
			)
		);
	};

	async function handleSave() {
		if (!validate()) {
			return;
		}
		dispatch(setAddingBot(true));
		const data = await BotService.createBot(details);
		dispatch(setAddingBot(true));
		if (!data) {
			return;
		}
		dispatch(addBot(data));
		dispatch(reset());
	}

	const handleAddPolls = (
		polls: {
			title: string;
			options: string[];
			isMultiSelect: boolean;
		}[]
	) => {
		dispatch(setPolls(polls));
	};

	const handleAddLeadsNurturing = (
		nurturing: {
			message: string;
			delay: string;
			unit: 'MINUTES' | 'HOURS' | 'DAYS';
		}[]
	) => {
		dispatch(
			setNurturing(
				nurturing.map((nurturing) => {
					return {
						message: nurturing.message,
						after:
							nurturing.unit === 'DAYS'
								? Number(nurturing.delay) * 86400
								: nurturing.unit === 'HOURS'
								? Number(nurturing.delay) * 3600
								: Number(nurturing.delay) * 60,
					};
				})
			)
		);
	};

	async function handleEditResponder() {
		if (!details.bot_id) return;
		if (!validate()) {
			return;
		}
		dispatch(setAddingBot(true));

		const res = await BotService.updateBot(details.bot_id, details);
		dispatch(setAddingBot(false));
		if (!res) {
			return;
		}
		dispatch(updateBot({ id: res.bot_id, data: res }));
		dispatch(reset());
	}

	function handleCancel() {
		dispatch(reset());
	}
	function openLeadNurturing() {
		if (details.nurturing.length === 0) {
			leadsNurturingRef.current?.open([
				{
					message: '',
					delay: '1',
					unit: 'MINUTES',
				},
			]);
		} else {
			leadsNurturingRef.current?.open(
				details.nurturing.map((nurturing) => {
					let unit = 'MINUTES' as 'MINUTES' | 'HOURS' | 'DAYS';
					let delay = nurturing.after;
					if (delay >= 86400) {
						delay = delay / 86400;
						unit = 'DAYS';
					} else if (delay >= 3600) {
						delay = delay / 3600;
						unit = 'HOURS';
					} else {
						delay = delay / 60;
						unit = 'MINUTES';
					}
					return {
						message: nurturing.message,
						delay: delay.toString(),
						unit: unit,
					};
				})
			);
		}
	}

	return (
		<Flex
			direction={'column'}
			gap={'0.5rem'}
			className='custom-scrollbar'
			justifyContent={'center'}
			px={'2rem'}
		>
			<Flex direction={'column'} gap={'0.5rem'}>
				<SubscriptionPopup isVisible={!canSendMessage} />
				<Flex direction={'column'} borderRadius={'20px'} mb={'1rem'} gap={2}>
					{/*--------------------------------- TRIGGER SECTION--------------------------- */}
					<FormControl
						isInvalid={!!ui.triggerError}
						display={'flex'}
						flexDirection={'column'}
						gap={2}
					>
						<Flex justifyContent={'space-between'} alignItems={'center'}>
							<Text className='text-gray-700 dark:text-gray-400'>Trigger</Text>
							<Flex gap={2} alignItems={'center'}>
								<IconButton
									isRound={true}
									variant='solid'
									aria-label='Done'
									size='xs'
									icon={!trigger ? <CheckIcon color='white' /> : <></>}
									onClick={() => dispatch(setTrigger(''))}
									className={`${
										!trigger ? '!bg-[#4CB072]' : '!bg-[#A6A6A6] '
									} hover:!bg-green-700 `}
								/>
								<Text fontSize='sm' color={theme === 'dark' ? 'white' : 'black'}>
									Default Message
								</Text>
							</Flex>
						</Flex>
						<TextAreaElement
							value={trigger ?? ''}
							onChange={(e) => dispatch(setTrigger(e.target.value))}
							isInvalid={!!ui.triggerError}
							placeholder={'ex. hello'}
						/>
						{ui.triggerError && <FormErrorMessage>{ui.triggerError}</FormErrorMessage>}
					</FormControl>

					{/*--------------------------------- RECIPIENTS SECTION--------------------------- */}

					<Flex gap={4}>
						<FormControl isInvalid={!!ui.respondToError} flexGrow={1}>
							<Text className='text-gray-700 dark:text-gray-400'>Recipients</Text>
							<SelectElement
								value={respond_to}
								onChangeText={(text) => dispatch(setRespondTo(text))}
								options={[
									{
										value: 'ALL',
										title: 'All',
									},
									{
										value: 'SAVED_CONTACTS',
										title: 'Saved Contacts',
									},
									{
										value: 'NON_SAVED_CONTACTS',
										title: 'Non Saved Contacts',
									},
								]}
							/>
							{ui.respondToError && <FormErrorMessage>{ui.respondToError}</FormErrorMessage>}
						</FormControl>
						<FormControl isInvalid={!!ui.optionsError} flexGrow={1}>
							<Text className='text-gray-700 dark:text-gray-400'>Conditions</Text>
							<SelectElement
								value={options}
								onChangeText={(text) => dispatch(setOptions(text))}
								options={[
									{
										value: 'INCLUDES_IGNORE_CASE',
										title: 'Includes Ignore Case',
									},
									{
										value: 'INCLUDES_MATCH_CASE',
										title: 'Includes Match Case',
									},
									{
										value: 'EXACT_IGNORE_CASE',
										title: 'Exact Ignore Case',
									},
									{
										value: 'EXACT_MATCH_CASE',
										title: 'Exact Match Case',
									},
								]}
							/>
							{ui.optionsError && <FormErrorMessage>{ui.optionsError}</FormErrorMessage>}
						</FormControl>
					</Flex>

					{/*--------------------------------- MESSAGE SECTION--------------------------- */}

					<FormControl isInvalid={!!ui.messageError}>
						<Textarea
							ref={messageRef}
							value={message ?? ''}
							minHeight={'80px'}
							onChange={(e) => dispatch(setMessage(e.target.value))}
							isInvalid={!!ui.messageError}
							placeholder={'Type your message here. \nex. You are invited to join fanfest'}
							width={'full'}
							border={'none'}
							className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
							_placeholder={{ opacity: 0.4, color: 'inherit' }}
							_focus={{ border: 'none', outline: 'none' }}
						/>
						{ui.messageError && <FormErrorMessage>{ui.messageError}</FormErrorMessage>}
					</FormControl>
					<Tag
						size={'sm'}
						m={'0.25rem'}
						p={'0.5rem'}
						width={'fit-content'}
						borderRadius='md'
						variant='solid'
						colorScheme='gray'
						_hover={{ cursor: 'pointer' }}
						onClick={() => insertVariablesToMessage('{{public_name}}')}
					>
						<TagLabel>{'{{public_name}}'}</TagLabel>
					</Tag>

					<HStack alignItems={'start'}>
						{/*--------------------------------- GAP & DELAY SECTION--------------------------- */}

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

					{/*--------------------------------- ATTACHMENTS, CONTACTS & POLLS SECTION--------------------------- */}
					<HStack>
						<Box flex={1}>
							<Text className='text-gray-700 dark:text-gray-400'>Attachments</Text>
							<Button
								width={'full'}
								size={'sm'}
								variant={'outline'}
								colorScheme='green'
								onClick={() => attachmentSelectorRef.current?.open(details.attachments)}
							>
								Select Attachments ({attachments.length}) Selected
							</Button>
						</Box>
						<Box flex={1}>
							<Text className='text-gray-700 dark:text-gray-400'>Contact Card</Text>
							<Button
								width={'full'}
								size={'sm'}
								variant={'outline'}
								colorScheme='green'
								onClick={() => contactSelectorRef.current?.open(details.shared_contact_cards)}
							>
								Select Contacts ({shared_contact_cards.length}) Selected
							</Button>
						</Box>
						<Box flex={1}>
							<Text className='text-gray-700 dark:text-gray-400'>Polls</Text>
							<Button
								width={'full'}
								size={'sm'}
								variant={'outline'}
								colorScheme='green'
								onClick={() => {
									if (details.polls.length === 0) {
										pollInputRef.current?.open([
											{
												title: '',
												options: ['', ''],
												isMultiSelect: false,
											},
										]);
									} else {
										pollInputRef.current?.open(details.polls);
									}
								}}
							>
								Add Polls ({details.polls.length}) Added
							</Button>
						</Box>
						<Box flex={1}>
							<Text className='text-gray-700 dark:text-gray-400'>Leads Nurturing</Text>
							<Button
								width={'full'}
								size={'sm'}
								variant={'solid'}
								colorScheme='green'
								onClick={openLeadNurturing}
							>
								Add Nurturing ({details.nurturing.length}) Added
							</Button>
						</Box>
					</HStack>

					{/*--------------------------------- FORWARD SECTION--------------------------- */}
					<Flex direction={'column'} gap={2} mt={'1rem'}>
						<Box position='relative'>
							<Divider height='2px' />
							<AbsoluteCenter
								bg={theme === 'dark' ? '#252525' : 'white'}
								px='4'
								color={theme === 'dark' ? 'gray.400' : 'gray.500'}
							>
								Forward Leads
							</AbsoluteCenter>
						</Box>
						<Box flex={1} mt={'0.5rem'}>
							<Text className='text-gray-700 dark:text-gray-400'>Forward To (without +)</Text>
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

					{/*--------------------------------- BUTTONS SECTION--------------------------- */}

					<HStack justifyContent={'space-between'} alignItems={'center'} py={8}>
						{isEditingBot ? (
							<>
								<Button
									bgColor={'red.300'}
									width={'100%'}
									onClick={handleCancel}
									isLoading={isAddingBot}
								>
									<Text color={'white'}>Cancel</Text>
								</Button>
								<Button
									isLoading={isAddingBot}
									bgColor={'green.300'}
									_hover={{
										bgColor: 'green.400',
									}}
									width={'100%'}
									onClick={handleEditResponder}
								>
									<Text color={'white'}>Save</Text>
								</Button>
							</>
						) : (
							<Button
								// isLoading={isAddingBot}
								bgColor={'green.300'}
								_hover={{
									bgColor: 'green.400',
								}}
								width={'100%'}
								onClick={handleSave}
							>
								<Text color={'white'}>Save</Text>
							</Button>
						)}
					</HStack>
				</Flex>
				<AllResponders />
			</Flex>
			<AttachmentSelectorDialog
				ref={attachmentSelectorRef}
				onConfirm={(ids) => dispatch(setAttachments(ids))}
			/>
			<ContactSelectorDialog
				ref={contactSelectorRef}
				onConfirm={(ids) => dispatch(setContactCards(ids))}
			/>
			<PollInputDialog ref={pollInputRef} onConfirm={handleAddPolls} />
			<InputLeadsNurturingDialog ref={leadsNurturingRef} onConfirm={handleAddLeadsNurturing} />
			<SubscriptionAlert />
		</Flex>
	);
}
