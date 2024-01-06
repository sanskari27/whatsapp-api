import { EditIcon } from '@chakra-ui/icons';
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
    HStack,
    Icon,
    IconButton,
    Input,
    Select,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text,
    Textarea,
    Th,
    Thead,
    Tr,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { useRef, useState } from 'react';
import { MdDelete } from 'react-icons/md';
import { PiPause, PiPlay } from 'react-icons/pi';
import { RiRobot2Line } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import useBot from '../../../hooks/useBot';
import { useTheme } from '../../../hooks/useTheme';
import { BotDetails } from '../../../services/bot.service';
import { StoreNames, StoreState } from '../../../store';
import {
    reset,
    setAttachments,
    setContactCards,
    setMessage,
    setOptions,
    setRespondTo,
    setTrigger,
} from '../../../store/reducers/ChatBoReducers';
import CheckButton from '../../components/check-button';
import ConfirmationDialog, {
    ConfirmationDialogHandle,
} from '../../components/confirmation-alert';
import SelectContactsOrAttachmentsList, {
    SelectContactOrAttachmentListHandle,
} from '../../components/contact-detail-input-dialog';

export default function Bot() {
    const multiselectRef = useRef<Multiselect | null>();
    const dispatch = useDispatch();
    const theme = useTheme();
    const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
    const contactAttachmentSelectRef =
        useRef<SelectContactOrAttachmentListHandle>(null);

    const {
        trigger,
        message,
        options,
        respond_to,
        shared_contact_cards,
        attachments,
    } = useSelector((state: StoreState) => state[StoreNames.CHATBOT]);
    const {
        add: addBot,
        addingBot,
        bots: allBots,
        deleteBot,
        editBot,
        toggleBot,
    } = useBot();
    const [trigger_details, setTriggerDetails] = useState<{
        trigger_gap_type: 'SECOND' | 'MINUTE' | 'HOUR';
        trigger_gap_time: number;
    }>({
        trigger_gap_type: 'SECOND',
        trigger_gap_time: 1,
    });

    const [delay_details, setDelayDetails] = useState<{
        delay_gap_type: 'SECOND' | 'MINUTE' | 'HOUR';
        delay_gap_time: number;
    }>({
        delay_gap_type: 'SECOND',
        delay_gap_time: 1,
    });

    const [uiDetails, setUiDetails] = useState<{
        isAddingBot: boolean;
        triggerError: string;
        messageError: string;
        respondToError: string;
        optionsError: string;
        contactCardsError: string;
        attachmentError: string;
        triggerGapError: string;
        delayGapError: string;
        editBot: {
            isEditing: boolean;
            botId: string;
        };
    }>({
        isAddingBot: false,
        triggerError: '',
        messageError: '',
        respondToError: '',
        optionsError: '',
        contactCardsError: '',
        attachmentError: '',
        triggerGapError: '',
        delayGapError: '',
        editBot: {
            isEditing: false,
            botId: '',
        },
    });

    const handleAddContactAndAttachment = () => {
        dispatch(
            setContactCards(contactAttachmentSelectRef.current?.contactId ?? [])
        );
        dispatch(
            setAttachments(
                contactAttachmentSelectRef.current?.attachmentId ?? []
            )
        );
    };

    const handleTriggerTimeUpdate = ({
        name,
        value,
    }: {
        name: keyof typeof trigger_details;
        value: string | number;
    }) => {
        setTriggerDetails((prev) => ({ ...prev, [name]: value }));
    };
    const handleDelayTimeUpdate = ({
        name,
        value,
    }: {
        name: keyof typeof delay_details;
        value: string | number;
    }) => {
        setDelayDetails((prev) => ({ ...prev, [name]: value }));
    };

    function handleSave() {
        if (allBots.map((bot) => bot.trigger).includes(trigger)) {
            setUiDetails((prevState) => ({
                ...prevState,
                triggerError: 'Trigger already exists',
            }));
            return;
        }
        if (
            !message &&
            attachments.length === 0 &&
            shared_contact_cards.length === 0
        ) {
            setUiDetails((prevState) => ({
                ...prevState,
                messageError:
                    'Message or Attachment or Contact Card is required',
            }));
            return;
        }
        if (!respond_to) {
            setUiDetails((prevState) => ({
                ...prevState,
                respondToError: 'Recipients is required',
            }));
            return;
        }
        if (!options) {
            setUiDetails((prevState) => ({
                ...prevState,
                optionsError: 'Conditions is required',
            }));
            return;
        }
        if (
            !trigger_details.trigger_gap_time ||
            trigger_details.trigger_gap_time <= 0
        ) {
            setUiDetails((prevState) => ({
                ...prevState,
                triggerGapError: 'Invalid Message Delay',
            }));
            return;
        }
        if (allBots.map((bot) => bot.trigger).includes(trigger)) {
            setUiDetails((prevState) => ({
                ...prevState,
                triggerError: 'Trigger already exists',
            }));
            return;
        }
        const trigger_gap_seconds =
            trigger_details.trigger_gap_type === 'HOUR'
                ? trigger_details.trigger_gap_time * 3600
                : trigger_details.trigger_gap_type === 'MINUTE'
                ? trigger_details.trigger_gap_time * 60
                : trigger_details.trigger_gap_time;
        addBot({
            message,
            trigger,
            respond_to,
            options,
            attachments,
            shared_contact_cards,
            trigger_gap_seconds: Number(trigger_gap_seconds),
        }).then(() => {
            multiselectRef.current?.resetSelectedValues();
            dispatch(reset());
        });
    }

    function handleEditResponder() {
        if (!uiDetails.editBot.botId) return;
        if (
            !trigger_details.trigger_gap_time ||
            trigger_details.trigger_gap_time <= 0
        ) {
            setUiDetails((prevState) => ({
                ...prevState,
                triggerGapError: 'Invalid Message Delay',
            }));
            return;
        }
        const trigger_gap_seconds =
            trigger_details.trigger_gap_type === 'HOUR'
                ? trigger_details.trigger_gap_time * 3600
                : trigger_details.trigger_gap_type === 'MINUTE'
                ? trigger_details.trigger_gap_time * 60
                : trigger_details.trigger_gap_time;
        editBot(uiDetails.editBot.botId, {
            message,
            trigger,
            respond_to,
            options,
            attachments,
            trigger_gap_seconds: Number(trigger_gap_seconds),
        }).then(() => {
            multiselectRef.current?.resetSelectedValues();
            setUiDetails((prevState) => ({
                ...prevState,
                editBot: {
                    botId: '',
                    isEditing: false,
                },
                triggerError: '',
            }));
            dispatch(reset());
        });
    }

    function handleCancel() {
        setUiDetails((prevState) => ({
            ...prevState,
            editBot: {
                botId: '',
                isEditing: false,
            },
            triggerError: '',
        }));
    }

    function editResponder(bot: BotDetails) {
        window.scrollTo(0, 0);
        setUiDetails((prevState) => ({
            ...prevState,
            editBot: {
                botId: bot.bot_id,
                isEditing: true,
            },
            triggerError: '',
        }));
        dispatch(setTrigger(bot.trigger));
        dispatch(setMessage(bot.message));
        dispatch(
            setRespondTo(
                bot.respond_to as
                    | ''
                    | 'ALL'
                    | 'SAVED_CONTACTS'
                    | 'NON_SAVED_CONTACTS'
            )
        );
        dispatch(
            setOptions(
                bot.options as
                    | ''
                    | 'INCLUDES_IGNORE_CASE'
                    | 'INCLUDES_MATCH_CASE'
                    | 'EXACT_IGNORE_CASE'
                    | 'EXACT_MATCH_CASE'
            )
        );
        const attachmentFilenames = bot.attachments.map(
            (attachment) => attachment.filename
        );
        dispatch(setAttachments(attachmentFilenames));
        dispatch(setContactCards(bot.shared_contact_cards));
        setTriggerDetails((prevState) => ({
            ...prevState,
            trigger_gap_time:
                bot.trigger_gap_seconds < 60
                    ? bot.trigger_gap_seconds
                    : bot.trigger_gap_seconds < 3600
                    ? Math.floor(bot.trigger_gap_seconds / 60)
                    : bot.trigger_gap_seconds < 86400
                    ? Math.floor(bot.trigger_gap_seconds / 3600)
                    : Math.floor(bot.trigger_gap_seconds / 86400),
            trigger_gap_type:
                Math.floor(bot.trigger_gap_seconds / 60) >= 60
                    ? 'HOUR'
                    : Math.floor(bot.trigger_gap_seconds / 60) >= 1
                    ? 'MINUTE'
                    : 'SECOND',
        }));
    }

    return (
        <Flex
            direction={'column'}
            gap={'0.5rem'}
            className="custom-scrollbar"
            justifyContent={'center'}
            width={'90%'}
            pl={'70px'}
        >
            <Flex direction={'column'} gap={'0.5rem'}>
                <Flex alignItems="center" gap={'0.5rem'} mt={'1.5rem'}>
                    <Icon
                        height={6}
                        width={6}
                        as={RiRobot2Line}
                        color={'green.400'}
                    />
                    <Text
                        fontSize={'xl'}
                        className="text-black dark:text-white"
                    >
                        Auto Responder
                    </Text>
                </Flex>

                <Flex
                    direction={'column'}
                    borderRadius={'20px'}
                    mb={'1rem'}
                    gap={2}
                >
                    <FormControl
                        isInvalid={!!uiDetails.triggerError}
                        display={'flex'}
                        flexDirection={'column'}
                        gap={2}
                    >
                        <Flex
                            justifyContent={'space-between'}
                            alignItems={'center'}
                        >
                            <Text className="text-gray-700 dark:text-gray-400">
                                Trigger
                            </Text>
                            <CheckButton
                                gap={2}
                                name={'GROUP'}
                                label="Default Message"
                                value={!trigger}
                                onChange={() => {
                                    setUiDetails((prevState) => {
                                        return {
                                            ...prevState,
                                            triggerError: '',
                                        };
                                    });
                                    dispatch(setTrigger(''));
                                }}
                                backgroundClassName="!bg-[#A6A6A6]"
                            />
                        </Flex>
                        <Textarea
                            width={'full'}
                            isInvalid={!!uiDetails.triggerError}
                            placeholder={'ex. hello'}
                            border={'none'}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _placeholder={{ opacity: 0.4, color: 'inherit' }}
                            _focus={{ border: 'none', outline: 'none' }}
                            value={trigger}
                            // isDisabled={!isAuthenticated}
                            onChange={(e) => {
                                setUiDetails((prevState) => {
                                    return {
                                        ...prevState,
                                        triggerError: '',
                                    };
                                });
                                dispatch(setTrigger(e.target.value));
                            }}
                        />
                        {uiDetails.triggerError && (
                            <FormErrorMessage>
                                {uiDetails.triggerError}
                            </FormErrorMessage>
                        )}
                    </FormControl>

                    <Flex gap={4}>
                        <FormControl
                            isInvalid={!!uiDetails.respondToError}
                            flexGrow={1}
                        >
                            <Text className="text-gray-700 dark:text-gray-400">
                                Recipients
                            </Text>
                            <Select
                                className={`!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full ${
                                    respond_to
                                        ? ' text-black dark:text-white'
                                        : ' text-gray-700 dark:text-gray-400'
                                }`}
                                border={'none'}
                                value={respond_to}
                                onChange={(e) => {
                                    {
                                        setUiDetails((prevState) => {
                                            return {
                                                ...prevState,
                                                respondToError: '',
                                            };
                                        });
                                        dispatch(
                                            setRespondTo(
                                                e.target.value as
                                                    | ''
                                                    | 'ALL'
                                                    | 'SAVED_CONTACTS'
                                                    | 'NON_SAVED_CONTACTS'
                                            )
                                        );
                                    }
                                }}
                                // isDisabled={!isAuthenticated}
                            >
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="ALL"
                                >
                                    All
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="SAVED_CONTACTS"
                                >
                                    Saved Contacts
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="NON_SAVED_CONTACTS"
                                >
                                    Non Saved Contacts
                                </option>
                            </Select>
                            {uiDetails.respondToError && (
                                <FormErrorMessage>
                                    {uiDetails.respondToError}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={!!uiDetails.optionsError}
                            flexGrow={1}
                        >
                            <Text className="text-gray-700 dark:text-gray-400">
                                Conditions
                            </Text>
                            <Select
                                // isDisabled={!isAuthenticated}
                                className={`!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full ${
                                    options
                                        ? ' text-black dark:text-white'
                                        : ' text-gray-700 dark:text-gray-400'
                                }`}
                                border={'none'}
                                value={options}
                                onChange={(e) => {
                                    {
                                        setUiDetails((prevState) => {
                                            return {
                                                ...prevState,
                                                optionsError: '',
                                            };
                                        });
                                        dispatch(
                                            setOptions(
                                                e.target.value as
                                                    | ''
                                                    | 'INCLUDES_IGNORE_CASE'
                                                    | 'INCLUDES_MATCH_CASE'
                                                    | 'EXACT_IGNORE_CASE'
                                                    | 'EXACT_MATCH_CASE'
                                            )
                                        );
                                    }
                                }}
                            >
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="INCLUDES_IGNORE_CASE"
                                >
                                    Includes Ignore Case
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="INCLUDES_MATCH_CASE"
                                >
                                    Includes Match Case
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="EXACT_IGNORE_CASE"
                                >
                                    Exact Ignore Case
                                </option>
                                <option
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                    value="EXACT_MATCH_CASE"
                                >
                                    Exact Match Case
                                </option>
                            </Select>
                            {uiDetails.optionsError && (
                                <FormErrorMessage>
                                    {uiDetails.optionsError}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                    </Flex>
                    <FormControl isInvalid={!!uiDetails.messageError}>
                        <Textarea
                            // isDisabled={!isAuthenticated}
                            width={'full'}
                            minHeight={'80px'}
                            size={'sm'}
                            rounded={'md'}
                            placeholder={
                                'Type your message here. \nex. You are invited to join fanfest'
                            }
                            border={'none'}
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                            _placeholder={{ opacity: 0.4, color: 'inherit' }}
                            _focus={{ border: 'none', outline: 'none' }}
                            value={message ?? ''}
                            onChange={(e) => {
                                setUiDetails((prevState) => {
                                    return {
                                        ...prevState,
                                        messageError: '',
                                    };
                                });
                                dispatch(setMessage(e.target.value));
                            }}
                        />
                        {uiDetails.messageError && (
                            <FormErrorMessage>
                                {uiDetails.messageError}
                            </FormErrorMessage>
                        )}
                    </FormControl>

                    <HStack alignItems={'start'}>
                        <FormControl
                            isInvalid={!!uiDetails.triggerGapError}
                            flex={1}
                        >
                            <Text className="text-gray-700 dark:text-gray-400">
                                Gap Delay
                            </Text>
                            <HStack>
                                <Input
                                    type="number"
                                    placeholder="10"
                                    size={'sm'}
                                    rounded={'md'}
                                    border={'none'}
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                    _focus={{
                                        border: 'none',
                                        outline: 'none',
                                    }}
                                    value={trigger_details.trigger_gap_time}
                                    onChange={(e) => {
                                        setUiDetails((prevState) => {
                                            return {
                                                ...prevState,
                                                triggerGapError: '',
                                            };
                                        });
                                        handleTriggerTimeUpdate({
                                            name: 'trigger_gap_time',
                                            value: e.target.value,
                                        });
                                    }}
                                    // isDisabled={!isAuthenticated}
                                />
                                <Select
                                    className={`!bg-[#ECECEC] dark:!bg-[#535353]  text-black dark:text-white  w-full `}
                                    rounded={'md'}
                                    border={'none'}
                                    size={'sm'}
                                    value={trigger_details.trigger_gap_type}
                                    onChange={(e) => {
                                        setUiDetails((prevState) => {
                                            return {
                                                ...prevState,
                                                triggerGapError: '',
                                            };
                                        });
                                        handleTriggerTimeUpdate({
                                            name: 'trigger_gap_type',
                                            value: e.target.value,
                                        });
                                    }}
                                    // isDisabled={!isAuthenticated}
                                >
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="SECOND"
                                    >
                                        Sec
                                    </option>
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="MINUTE"
                                    >
                                        Min
                                    </option>
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="HOUR"
                                    >
                                        Hour
                                    </option>
                                </Select>
                            </HStack>
                            {uiDetails.triggerGapError && (
                                <FormErrorMessage>
                                    {uiDetails.triggerGapError}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <FormControl
                            isInvalid={!!uiDetails.delayGapError}
                            flex={1}
                        >
                            <Text className="text-gray-700 dark:text-gray-400">
                                Message Delay
                            </Text>
                            <HStack>
                                <Input
                                    type="number"
                                    placeholder="10"
                                    size={'sm'}
                                    rounded={'md'}
                                    border={'none'}
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                    _focus={{
                                        border: 'none',
                                        outline: 'none',
                                    }}
                                    value={delay_details.delay_gap_time}
                                    onChange={(e) => {
                                        setUiDetails((prevState) => {
                                            return {
                                                ...prevState,
                                                delayGapError: '',
                                            };
                                        });
                                        handleDelayTimeUpdate({
                                            name: 'delay_gap_time',
                                            value: e.target.value,
                                        });
                                    }}
                                />
                                <Select
                                    className={`!bg-[#ECECEC] dark:!bg-[#535353]  text-black dark:text-white  w-full `}
                                    rounded={'md'}
                                    border={'none'}
                                    size={'sm'}
                                    value={delay_details.delay_gap_type}
                                    onChange={(e) => {
                                        setUiDetails((prevState) => {
                                            return {
                                                ...prevState,
                                                delayGapError: '',
                                            };
                                        });
                                        handleDelayTimeUpdate({
                                            name: 'delay_gap_type',
                                            value: e.target.value,
                                        });
                                    }}
                                >
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="SECOND"
                                    >
                                        Sec
                                    </option>
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="MINUTE"
                                    >
                                        Min
                                    </option>
                                    <option
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="HOUR"
                                    >
                                        Hour
                                    </option>
                                </Select>
                            </HStack>
                            {uiDetails.triggerGapError && (
                                <FormErrorMessage>
                                    {uiDetails.triggerGapError}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <Box>
                            <Text className="text-gray-700 dark:text-gray-400">
                                Attachments
                            </Text>
                            <Button
                                width={'full'}
                                size={'sm'}
                                variant={'outline'}
                                colorScheme="green"
                                onClick={() => {
                                    contactAttachmentSelectRef.current?.open();
                                    contactAttachmentSelectRef.current?.setAttachmentId(
                                        attachments
                                    );
                                    contactAttachmentSelectRef.current?.setType(
                                        'Attachments'
                                    );
                                }}
                                // isDisabled={!isAuthenticated}
                            >
                                Select Attachments ({attachments.length})
                                Selected
                            </Button>
                        </Box>
                        <Box>
                            <Text className="text-gray-700 dark:text-gray-400">
                                Contact Card
                            </Text>
                            <Button
                                width={'full'}
                                size={'sm'}
                                variant={'outline'}
                                colorScheme="green"
                                onClick={() => {
                                    contactAttachmentSelectRef.current?.open();
                                    contactAttachmentSelectRef.current?.setContactId(
                                        shared_contact_cards
                                    );
                                    contactAttachmentSelectRef.current?.setType(
                                        'Contacts'
                                    );
                                }}
                                // isDisabled={!isAuthenticated}
                            >
                                Select Contacts ({shared_contact_cards.length})
                                Selected
                            </Button>
                        </Box>
                    </HStack>

                    <HStack
                        justifyContent={'space-between'}
                        alignItems={'center'}
                        py={8}
                    >
                        <Button
                            bgColor={
                                uiDetails.editBot.isEditing
                                    ? 'red.300'
                                    : 'green.300'
                            }
                            width={'100%'}
                            onClick={
                                uiDetails.editBot.isEditing
                                    ? handleCancel
                                    : handleSave
                            }
                            isLoading={addingBot}
                            // isDisabled={!isAuthenticated}
                        >
                            <Text color={'white'}>
                                {uiDetails.editBot.isEditing
                                    ? 'Cancel'
                                    : 'Save'}
                            </Text>
                        </Button>
                        {uiDetails.editBot.isEditing && (
                            <Button
                                isLoading={addingBot}
                                bgColor={'green.300'}
                                _hover={{
                                    bgColor: 'green.400',
                                }}
                                width={'100%'}
                                onClick={handleEditResponder}
                                // isDisabled={!isAuthenticated}
                            >
                                <Text color={'white'}>Edit</Text>
                            </Button>
                        )}
                    </HStack>
                    {/* <Divider /> */}

                    {/* <Flex direction={'column'} hidden={all.length === 0}> */}
                    <Text
                        fontSize={'2xl'}
                        className="text-gray-700 dark:text-gray-400"
                        textAlign={'center'}
                        pt={'2rem'}
                        pb={'1rem'}
                    >
                        All Responders
                    </Text>
                    <TableContainer>
                        <Table>
                            <Thead>
                                <Tr>
                                    <Th>Trigger</Th>
                                    <Th>Message</Th>
                                    <Th>Recipients</Th>
                                    <Th>Conditions</Th>
                                    <Th p={0}>Attachments</Th>
                                    <Th>Delay</Th>
                                    <Th>Actions</Th>
                                </Tr>
                            </Thead>
                            <Tbody
                                textColor={theme === 'dark' ? 'white' : 'black'}
                            >
                                {allBots.map((bot, index) => (
                                    <Tr key={index}>
                                        <Td>
                                            {bot.trigger
                                                .split('\n')
                                                .map((trigger, index) => (
                                                    <Box key={index}>
                                                        {trigger.length > 20
                                                            ? trigger.substring(
                                                                  0,
                                                                  18
                                                              ) + '...'
                                                            : trigger}
                                                    </Box>
                                                ))}
                                        </Td>
                                        <Td>
                                            <Box>
                                                {bot.message
                                                    .split('\n')
                                                    .map((message, index) => (
                                                        <Box key={index}>
                                                            {message.length > 20
                                                                ? message.substring(
                                                                      0,
                                                                      18
                                                                  ) + '...'
                                                                : message}
                                                        </Box>
                                                    ))}
                                            </Box>
                                        </Td>
                                        <Td>
                                            {bot.respond_to
                                                .split('_')
                                                .join(' ')}
                                        </Td>
                                        <Td>
                                            {bot.options.split('_').join(' ')}
                                        </Td>
                                        <Td>{bot.attachments.length}</Td>
                                        <Td>
                                            {bot.trigger_gap_seconds < 60
                                                ? `${bot.trigger_gap_seconds} s`
                                                : bot.trigger_gap_seconds < 3600
                                                ? `${Math.floor(
                                                      bot.trigger_gap_seconds /
                                                          60
                                                  )} m`
                                                : bot.trigger_gap_seconds <
                                                  86400
                                                ? `${Math.floor(
                                                      bot.trigger_gap_seconds /
                                                          3600
                                                  )} h`
                                                : `${Math.floor(
                                                      bot.trigger_gap_seconds /
                                                          86400
                                                  )} day`}
                                        </Td>
                                        <Td>
                                            <IconButton
                                                aria-label="Delete"
                                                icon={<MdDelete />}
                                                color={'red.400'}
                                                onClick={() => {
                                                    confirmationDialogRef.current?.open(
                                                        bot.bot_id
                                                    );
                                                }}
                                                bgColor={'transparent'}
                                                _hover={{
                                                    bgColor: 'transparent',
                                                }}
                                                outline="none"
                                                border="none"
                                            />
                                            <IconButton
                                                aria-label="Edit"
                                                icon={<EditIcon />}
                                                color={'yellow.400'}
                                                onClick={() =>
                                                    editResponder(bot)
                                                }
                                                bgColor={'transparent'}
                                                _hover={{
                                                    bgColor: 'transparent',
                                                }}
                                                outline="none"
                                                border="none"
                                            />
                                            <IconButton
                                                aria-label="toggle"
                                                icon={
                                                    bot.isActive ? (
                                                        <PiPause />
                                                    ) : (
                                                        <PiPlay />
                                                    )
                                                }
                                                color={
                                                    bot.isActive
                                                        ? 'blue.400'
                                                        : 'green.400'
                                                }
                                                onClick={() => {
                                                    toggleBot(bot.bot_id);
                                                }}
                                                bgColor={'transparent'}
                                                _hover={{
                                                    bgColor: 'transparent',
                                                }}
                                                outline="none"
                                                border="none"
                                            />
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Flex>
            </Flex>
            <ConfirmationDialog
                type={'Responder'}
                ref={confirmationDialogRef}
                onConfirm={deleteBot}
            />
            <SelectContactsOrAttachmentsList
                ref={contactAttachmentSelectRef}
                onConfirm={handleAddContactAndAttachment}
            />
        </Flex>
    );
}
