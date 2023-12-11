/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AddIcon,
    AttachmentIcon,
    DeleteIcon,
    InfoOutlineIcon,
} from '@chakra-ui/icons';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    HStack,
    Heading,
    Icon,
    IconButton,
    Input,
    Select,
    Tag,
    TagCloseButton,
    TagLabel,
    Text,
    Textarea,
    useDisclosure,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import useAttachment from '../../../hooks/useAttachment';
import useTemplate from '../../../hooks/useTemplate';
import { useTheme } from '../../../hooks/useTheme';
import ExportsService from '../../../services/exports.service';
import GroupService from '../../../services/group.service';
import LabelService from '../../../services/label.service';
import MessageService from '../../../services/message.service';
import UploadsService from '../../../services/uploads.service';
import { StoreNames, StoreState } from '../../../store';
import {
    reset,
    setAttachments,
    setBatchDelay,
    setBatchSize,
    setBusinessAccount,
    setCSVFile,
    setCampaignName,
    setContactCards,
    setEndTime,
    setGroupRecipients,
    setLabelRecipients,
    setMaxDelay,
    setMessage,
    setMinDelay,
    setRecipients,
    setRecipientsFrom,
    setRecipientsLoading,
    setStartTime,
    setVariables,
} from '../../../store/reducers/SchedulerReducer';
import AttachmentDetailsInputDialog from '../../components/attachment-details-input-dialog';
import ContactDetailInputDialog from '../../components/contact-detail-input-dialog';
import { CSVNameInputDialoag, TemplateNameInputDialog } from './components';

export type SchedulerDetails = {
    type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
    numbers?: string[];
    csv_file: string;
    group_ids: string[];
    label_ids: string[];
    message: string;
    variables: string[];
    shared_contact_cards: {
        first_name?: string;
        middle_name?: string;
        last_name?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        links?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }[];
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
    const fileInputRef = useRef<HTMLInputElement | null>();
    const multiselectRef = useRef<Multiselect | null>();
    const dispatch = useDispatch();
    const theme = useTheme();
    const {
        isOpen: isCSVNameInputOpen,
        onOpen: openCSVNameInput,
        onClose: closeCSVNameInput,
    } = useDisclosure();
    const [newCSVDetails, setNewCSVDetails] = useState<{
        file: File | null;
        name: string;
    }>({
        file: null,
        name: '',
    });
    const { templates, add: addToTemplate, addingTemplate } = useTemplate();
    const {
        isOpen: isNameInputOpen,
        onOpen: openNameInput,
        onClose: closeNameInput,
    } = useDisclosure();

    const {
        attachments: allAttachments,
        add: addAttachment,
        addingAttachment,
    } = useAttachment();

    const {
        isOpen: isAttachmentDetailsOpen,
        onOpen: openAttachmentDetailsInput,
        onClose: closeAttachmentDetailsInput,
    } = useDisclosure();

    const {
        isOpen: isContactInputOpen,
        onOpen: openContactInput,
        onClose: closeContactInput,
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

    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);

    const { details, isBusinessAccount, recipients } = useSelector(
        (state: StoreState) => state[StoreNames.SCHEDULER]
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

    const fetchRecipients = useCallback(
        function (type: string) {
            dispatch(setRecipientsLoading(true));
            if (type === 'GROUP') {
                GroupService.listGroups()
                    .then((data) => dispatch(setRecipients(data)))
                    .finally(() => {
                        dispatch(setRecipientsLoading(false));
                    });
            } else if (type === 'GROUP_INDIVIDUAL') {
                GroupService.listGroups()
                    .then((data) => dispatch(setRecipients(data)))
                    .finally(() => {
                        dispatch(setRecipientsLoading(false));
                    });
            } else if (type === 'LABEL') {
                LabelService.listLabels()
                    .then((data) => dispatch(setRecipients(data)))
                    .catch((err) => {
                        if (err === 'BUSINESS_ACCOUNT_REQUIRED') {
                            dispatch(setRecipientsFrom('NUMBERS'));
                            dispatch(setBusinessAccount(false));
                        }
                    })
                    .finally(() => {
                        dispatch(setRecipientsLoading(false));
                    });
            } else if (type === 'CSV') {
                UploadsService.listCSV()
                    .then((data) => dispatch(setRecipients(data)))
                    .finally(() => {
                        dispatch(setRecipientsLoading(false));
                    });
            }
        },
        [dispatch]
    );

    function exportFilteredNumbers() {
        setUIDetails((prevState) => ({
            ...prevState,
            loadingVerifiedContacts: true,
        }));
        ExportsService.exportValidNumbersExcel({
            type: 'CSV',
            csv_file: details.csv_file,
        }).finally(() => {
            setUIDetails((prevState) => ({
                ...prevState,
                loadingVerifiedContacts: false,
            }));
        });
    }

    function uploadNewCSV() {
        if (!newCSVDetails.file) return;
        const { file, name } = newCSVDetails;
        setUIDetails((prev) => ({ ...prev, uploadingCSV: true }));
        UploadsService.uploadCSV({ file, name })
            .then((res) => {
                if (res.name === 'ERROR') {
                    setUIDetails((prev) => ({
                        ...prev,
                        uploadingCSV: false,
                        messageError: res.id,
                    }));
                    setTimeout(() => {
                        setUIDetails((prev) => ({
                            ...prev,
                            messageError: '',
                        }));
                    }, 5000);
                    return;
                }
                // setRecipientsOptions((prev) => [res, ...prev]);
                dispatch(setRecipients([res, ...recipients]));
            })
            .finally(() => {
                setUIDetails((prev) => ({ ...prev, uploadingCSV: false }));
            });
    }

    const handleCSVFileInput = (e: ChangeEvent<HTMLInputElement>) => {
        setUIDetails((prev) => ({ ...prev, messageError: '' }));
        const files = e.target.files;
        if (files === null) return;
        if (files.length === 0) return;
        if (files[0] === null) return;
        if (files[0].type !== 'text/csv') return;
        setUIDetails((prev) => ({
            ...prev,
            uploadingCSV: false,
            messageError: 'File type should be CSV',
        }));
        if (files[0].size > 10000000) return;
        setUIDetails((prev) => ({
            ...prev,
            uploadingCSV: false,
            messageError: 'File size should be less than 10MB',
        }));
        const file = files[0];
        if (fileInputRef.current) fileInputRef.current.value = '';
        setNewCSVDetails((prev) => ({ ...prev, file }));
        openCSVNameInput();
    };

    const handleAttachmentInput = (e: ChangeEvent<HTMLInputElement>) => {
        setFileError(null);
        const files = e.target.files;
        if (files === null) return;
        if (files.length === 0) return;
        if (files[0] === null) return;
        if (files[0].size > 62914560)
            return setFileError('File size should be less than 60MB');
        const file = files[0];
        if (fileInputRef.current) fileInputRef.current.value = '';
        setAttachmentFile(file);
        openAttachmentDetailsInput();
    };

    const handleContactInput = (contactDetails: {
        first_name?: string;
        last_name?: string;
        title?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        links?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }) => {
        if (!contactDetails.first_name) return;
        // addContact(contactDetails);
        dispatch(
            setContactCards([...details.shared_contact_cards, contactDetails])
        );
        closeContactInput();
    };

    const removeContact = (contact: {
        first_name?: string;
        last_name?: string;
        middle_name?: string;
        organization?: string;
        email_personal?: string;
        email_work?: string;
        contact_number_phone?: string;
        contact_number_work?: string;
        contact_number_other?: string[];
        links?: string[];
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        pincode?: string;
    }) => {
        // setDetails((prevState) => ({
        //     ...prevState,
        //     shared_contact_cards: prevState.shared_contact_cards.filter(
        //         (data) => data !== contact
        //     ),
        // }));
        dispatch(
            setContactCards(
                details.shared_contact_cards.filter((data) => data !== contact)
            )
        );
    };

    const setSelectedRecipients = (ids: string[]) => {
        if (details.type === 'GROUP' || details.type === 'GROUP_INDIVIDUAL') {
            // handleChange({ name: 'group_ids', value: ids });
            dispatch(setGroupRecipients(ids));
        } else if (details.type === 'LABEL') {
            // handleChange({ name: 'label_ids', value: ids });
            dispatch(setLabelRecipients(ids));
        }
    };

    const scheduleMessage = () => {
        if (!details.campaign_name) {
            setError((prev) => ({
                ...prev,
                campaignName: 'Campaign Name is required',
            }));
            console.log(error);
            return;
        }

        if (details.type === 'CSV' && details.csv_file === '') {
            setError((prev) => ({
                ...prev,
                recipients: 'Recipients are required',
            }));
            console.log(error);
            return;
        }
        if (details.type === 'GROUP' && details.group_ids.length === 0) {
            setError((prev) => ({
                ...prev,
                recipients: 'Recipients are required',
            }));
            console.log(error);
            return;
        }
        if (
            details.type === 'GROUP_INDIVIDUAL' &&
            details.group_ids.length === 0
        ) {
            setError((prev) => ({
                ...prev,
                recipients: 'Recipients are required',
            }));
            console.log(error);
            return;
        }
        if (details.type === 'LABEL' && details.label_ids.length === 0) {
            setError((prev) => ({
                ...prev,
                recipients: 'Recipients are required',
            }));
            console.log(error);
            return;
        }
        if (!details.message) {
            setError((prev) => ({ ...prev, message: 'Message is required' }));
            console.log(error);
            return;
        }
        if (details.min_delay < 1) {
            setError((prev) => ({
                ...prev,
                minDelay: 'Minimum Delay is required',
            }));
            console.log(error);
            return;
        }
        if (details.max_delay < 1) {
            setError((prev) => ({
                ...prev,
                maxDelay: 'Maximum Delay is required',
            }));
            console.log(error);
            return;
        }
        if (details.batch_size < 1) {
            setError((prev) => ({
                ...prev,
                batchSize: 'Batch Size is required',
            }));
            console.log(error);
            return;
        }
        if (details.batch_delay < 1) {
            setError((prev) => ({
                ...prev,
                batchDelay: 'Batch Delay is required',
            }));
            console.log(error);
            return;
        }

        // if (
        //     details.max_delay === 0 ||
        //     details.min_delay === 0 ||
        //     details.batch_delay === 0
        // ) {
        //     setUIDetails((prev) => ({
        //         ...prev,
        //         delayError: 'Delay required.',
        //     }));
        //     return;
        // }
        // if (details.batch_size === 0) {
        //     setUIDetails((prev) => ({
        //         ...prev,
        //         delayError: 'Batch size required.',
        //     }));
        //     return;
        // }
        setUIDetails((prev) => ({
            ...prev,
            schedulingMessages: true,
        }));
        MessageService.scheduleMessage(details).then((errorMessage) => {
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
            multiselectRef.current?.resetSelectedValues();
            openCampaignCreation();
            // setDetails({
            //     type: 'CSV',
            //     numbers: [],
            //     csv_file: '',
            //     group_ids: [],
            //     label_ids: [],
            //     message: '',
            //     variables: [],
            //     shared_contact_cards: [],
            //     attachments: [],
            //     campaign_name: '',
            //     min_delay: 1,
            //     max_delay: 60,
            //     startTime: '00:00',
            //     endTime: '23:59',
            //     batch_delay: 120,
            //     batch_size: 1,
            // });
            dispatch(reset());
            // setUIDetails((prev) => ({
            //     recipientsLoading: false,
            //     paymentVerified: prev.paymentVerified,
            //     schedulingMessages: false,
            //     isBusiness: prev.isBusiness,
            //     nameError: '',
            //     messageError: '',
            //     delayError: '',
            //     apiError: '',
            // }));
            setUIDetails((prev) => ({
                ...prev,
                schedulingMessages: false,
            }));
        });
    };

    useEffect(() => {
        fetchRecipients(details.type);
    }, [fetchRecipients, details.type]);

    return (
        <Flex padding={'1rem'} justifyContent={'center'} width={'full'}>
            <Flex direction={'column'}>
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
                            <FormLabel
                                color={theme === 'dark' ? 'white' : 'GrayText'}
                            >
                                Campaign Name
                            </FormLabel>
                            <Input
                                color={theme === 'dark' ? 'white' : 'GrayText'}
                                type="text"
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
                                <FormErrorMessage>
                                    {error.campaignName}
                                </FormErrorMessage>
                            )}
                        </FormControl>
                        <HStack alignItems={'start'} pt={4}>
                            <FormControl>
                                <FormLabel
                                    color={
                                        theme === 'dark' ? 'white' : 'GrayText'
                                    }
                                >
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
                                        value="CSV"
                                    >
                                        CSV
                                    </option>
                                    <option
                                        className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="GROUP"
                                    >
                                        Groups
                                    </option>
                                    <option
                                        className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        value="GROUP_INDIVIDUAL"
                                    >
                                        Group Individuals
                                    </option>
                                    {isBusinessAccount ? (
                                        <option
                                            className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                            value="LABEL"
                                        >
                                            Labels
                                        </option>
                                    ) : null}
                                </Select>
                            </FormControl>
                            <FormControl
                                alignItems="flex-end"
                                justifyContent={'space-between'}
                                hidden={
                                    ![
                                        'CSV',
                                        'GROUP',
                                        'GROUP_INDIVIDUAL',
                                        'LABEL',
                                    ].includes(details.type)
                                }
                                width={'full'}
                                isInvalid={!!error.recipients}
                            >
                                <FormLabel
                                    color={
                                        theme === 'dark' ? 'white' : 'GrayText'
                                    }
                                >
                                    Choose Existing Database
                                </FormLabel>
                                {details.type === 'CSV' ? (
                                    <Flex direction={'column'} gap={2}>
                                        <Select
                                            className="!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white "
                                            border={'none'}
                                            value={details.csv_file}
                                            onChange={(e) => {
                                                setError((prev) => ({
                                                    ...prev,
                                                    recipients: '',
                                                }));
                                                dispatch(
                                                    setCSVFile(e.target.value)
                                                );
                                                // handleChange({
                                                //     name: 'csv_file',
                                                //     value: e.target.value,
                                                // });
                                                const recipient =
                                                    recipients.find(
                                                        (recipient) =>
                                                            recipient.id ===
                                                            e.target.value
                                                    );
                                                if (
                                                    !recipient ||
                                                    !recipient.headers
                                                )
                                                    return;
                                                const headers =
                                                    recipient.headers.map(
                                                        (item) => `{{${item}}}`
                                                    );
                                                if (recipient)
                                                    // handleChange({
                                                    //     name: 'variables',
                                                    //     value: headers,
                                                    // });
                                                    dispatch(
                                                        setVariables(headers)
                                                    );
                                            }}
                                        >
                                            <option
                                                value={'select'}
                                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                            >
                                                Select one!
                                            </option>
                                            {recipients.map(({ id, name }) => (
                                                <option
                                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                                    value={id}
                                                    key={id}
                                                >
                                                    {name}
                                                </option>
                                            ))}
                                        </Select>
                                    </Flex>
                                ) : (
                                    <Multiselect
                                        disable={uiDetails.recipientsLoading}
                                        displayValue="displayValue"
                                        placeholder={
                                            details.type === 'GROUP'
                                                ? 'Select Groups'
                                                : details.type ===
                                                  'GROUP_INDIVIDUAL'
                                                ? 'Select Groups'
                                                : details.type === 'LABEL'
                                                ? 'Select Labels'
                                                : 'Select One!'
                                        }
                                        onRemove={(selectedList) =>
                                            setSelectedRecipients(
                                                selectedList.map(
                                                    (label: any) => label.id
                                                )
                                            )
                                        }
                                        onSelect={(selectedList) => {
                                            setError((prev) => ({
                                                ...prev,
                                                recipients: '',
                                            }));
                                            setSelectedRecipients(
                                                selectedList.map(
                                                    (label: any) => label.id
                                                )
                                            );
                                        }}
                                        showCheckbox={true}
                                        hideSelectedList={true}
                                        options={recipients.map(
                                            (item, index) => ({
                                                ...item,
                                                displayValue: `${index + 1}. ${
                                                    item.name
                                                }`,
                                            })
                                        )}
                                        style={{
                                            searchBox: {
                                                border: 'none',
                                            },
                                            inputField: {
                                                width: '100%',
                                            },
                                        }}
                                        className="  bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none w-full "
                                    />
                                )}
                                {error.recipients && (
                                    <FormErrorMessage>
                                        {error.recipients}
                                    </FormErrorMessage>
                                )}
                            </FormControl>
                        </HStack>
                        {details.type === 'CSV' ? (
                            <>
                                <Flex gap={2} alignItems={'center'} py={4}>
                                    <Divider />
                                    <Text
                                        size={'sm'}
                                        className="text-gray-900 dark:text-gray-200"
                                    >
                                        OR
                                    </Text>
                                    <Divider />
                                </Flex>
                                <Flex justifyContent={'space-between'} gap={2}>
                                    <Button
                                        flexGrow={1}
                                        variant={'outline'}
                                        colorScheme="blue"
                                        // isDisabled={isDisabled}
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    'csv-file-input'
                                                )
                                                ?.click()
                                        }
                                        isLoading={uiDetails.uploadingCSV}
                                    >
                                        <Text>Upload</Text>
                                    </Button>
                                    <IconButton
                                        variant="outline"
                                        colorScheme="blue"
                                        aria-label="Download"
                                        _hover={{
                                            backgroundColor: 'transparent',
                                        }}
                                        icon={
                                            <Icon
                                                // as={GrDocumentCsv}
                                                className="dark:invert"
                                            />
                                        }
                                        onClick={() => {
                                            window.open(
                                                'https://docs.google.com/spreadsheets/d/1qj7u0e8OhrFHYj6bHlPAnORC5uRpKI3xoxW7PRAjxWM/edit#gid=0',
                                                '_blank'
                                            );
                                        }}
                                    />
                                </Flex>
                                <Box py={'0.5rem'} textAlign={'center'}>
                                    <Text size={'sm'} color={'yellow.300'}>
                                        <InfoOutlineIcon
                                            marginRight={'0.25rem'}
                                        />
                                        The first column header should be
                                        "number" and should contain numbers with
                                        country codes. Remaining column headers
                                        can be of variables in message
                                    </Text>
                                </Box>
                                <HStack width={'full'}>
                                    <Button
                                        width={'full'}
                                        variant={'outline'}
                                        colorScheme="red"
                                        onClick={() => {
                                            setUIDetails((prev) => ({
                                                ...prev,
                                                deletingCSV: true,
                                            }));
                                            recipients.forEach((recipient) => {
                                                if (
                                                    recipient.id ===
                                                    details.csv_file
                                                ) {
                                                    if (!recipient._id) return;
                                                    UploadsService.deleteCSV(
                                                        recipient._id
                                                    ).finally(() => {
                                                        setUIDetails(
                                                            (prev) => ({
                                                                ...prev,
                                                                deletingCSV:
                                                                    false,
                                                            })
                                                        );
                                                        // handleChange({
                                                        //     name: 'csv_file',
                                                        //     value: 'select',
                                                        // });
                                                        dispatch(
                                                            setCSVFile('select')
                                                        );
                                                        fetchRecipients('CSV');
                                                    });
                                                }
                                            });
                                        }}
                                        hidden={
                                            !details.csv_file ||
                                            details.csv_file === 'select'
                                        }
                                        isLoading={uiDetails.deletingCSV}
                                        leftIcon={<DeleteIcon />}
                                        // disabled={isDisabled}
                                    >
                                        <Text>Delete</Text>
                                    </Button>

                                    <Button
                                        width={'full'}
                                        variant={'outline'}
                                        colorScheme="yellow"
                                        onClick={exportFilteredNumbers}
                                        hidden={
                                            !details.csv_file ||
                                            details.csv_file === 'select'
                                        }
                                        isLoading={
                                            uiDetails.loadingVerifiedContacts
                                        }
                                        // disabled={isDisabled}
                                        leftIcon={<FiFilter />}
                                    >
                                        <Text>Filter Numbers</Text>
                                    </Button>

                                    <input
                                        type="file"
                                        name="csv-file-input"
                                        id="csv-file-input"
                                        className="invisible h-[1px] absolute"
                                        multiple={false}
                                        accept=".csv"
                                        ref={(ref) =>
                                            (fileInputRef.current = ref)
                                        }
                                        onInput={handleCSVFileInput}
                                    />
                                    <CSVNameInputDialoag
                                        isOpen={isCSVNameInputOpen}
                                        onClose={() => {
                                            closeCSVNameInput();
                                            setNewCSVDetails({
                                                file: null,
                                                name: '',
                                            });
                                        }}
                                        onConfirm={() => {
                                            uploadNewCSV();
                                            closeCSVNameInput();
                                        }}
                                        handleTextChange={(text) =>
                                            setNewCSVDetails((prev) => ({
                                                ...prev,
                                                name: text,
                                            }))
                                        }
                                    />
                                </HStack>
                            </>
                        ) : null}
                    </Flex>
                    <HStack gap={8}>
                        <Flex
                            direction={'column'}
                            gap={2}
                            // hidden={isHidden}
                        >
                            <Box justifyContent={'space-between'}>
                                <Text
                                    className="text-gray-700 dark:text-white"
                                    pt={4}
                                >
                                    Select Template
                                </Text>
                                <Flex gap={3} alignItems={'center'} pt={2}>
                                    <Select
                                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                        border={'none'}
                                        rounded={'md'}
                                        onChange={(e) =>
                                            // handleChange({
                                            //     name: 'message',
                                            //     value: e.target.value,
                                            // })
                                            {
                                                setError((prev) => ({
                                                    ...prev,
                                                    message: '',
                                                }));
                                                dispatch(
                                                    setMessage(e.target.value)
                                                );
                                            }
                                        }
                                    >
                                        <option
                                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                            value={''}
                                        >
                                            Select template!
                                        </option>
                                        {(templates ?? []).map(
                                            ({ name, message }, index) => (
                                                <option
                                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                                    value={message}
                                                    key={index}
                                                >
                                                    {name}
                                                </option>
                                            )
                                        )}
                                    </Select>
                                    <Button
                                        width={'200px'}
                                        colorScheme="green"
                                        aria-label="Add Template"
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
                                    <TemplateNameInputDialog
                                        isOpen={isNameInputOpen}
                                        onClose={closeNameInput}
                                        onConfirm={(name) => {
                                            if (!details.message) return;
                                            addToTemplate(
                                                name,
                                                details.message
                                            );
                                            closeNameInput();
                                        }}
                                    />
                                </Flex>
                            </Box>
                            <FormControl isInvalid={!!error.message}>
                                <Textarea
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
                                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                    _placeholder={{
                                        opacity: 0.4,
                                        color: 'inherit',
                                    }}
                                    _focus={{ border: 'none', outline: 'none' }}
                                    value={details.message ?? ''}
                                    onChange={(e) =>
                                        // handleChange({ name: 'message', value: e.target.value })
                                        {
                                            setError((prev) => ({
                                                ...prev,
                                                message: '',
                                            }));
                                            dispatch(
                                                setMessage(e.target.value)
                                            );
                                        }
                                    }
                                />
                                {error.message && (
                                    <FormErrorMessage>
                                        {error.message}
                                    </FormErrorMessage>
                                )}
                            </FormControl>

                            <Box hidden={details.type !== 'CSV'}>
                                <Text className="text-gray-700 dark:text-white">
                                    Variables
                                </Text>
                                <Box>
                                    {details.variables.map(
                                        (variable: string, index) => (
                                            <Tag
                                                size={'sm'}
                                                m={'0.25rem'}
                                                p={'0.5rem'}
                                                key={index}
                                                borderRadius="md"
                                                variant="solid"
                                                colorScheme="gray"
                                                _hover={{ cursor: 'pointer' }}
                                                onClick={() =>
                                                    // handleChange({
                                                    //     name: 'message',
                                                    //     value: `${details.message} ${variable}`,
                                                    // })
                                                    {
                                                        setError((prev) => ({
                                                            ...prev,
                                                            message: '',
                                                        }));
                                                        dispatch(
                                                            setMessage(
                                                                `${details.message} ${variable}`
                                                            )
                                                        );
                                                    }
                                                }
                                            >
                                                <TagLabel>{variable}</TagLabel>
                                            </Tag>
                                        )
                                    )}
                                </Box>
                            </Box>
                            <Box>
                                <Text className="text-gray-700 dark:text-white">
                                    Attachments
                                </Text>
                                <Flex
                                    gap={2}
                                    alignItems={'center'}
                                    width={'full'}
                                >
                                    <Multiselect
                                        displayValue="displayValue"
                                        placeholder={'Select Attachments'}
                                        onRemove={(
                                            selectedList: typeof allAttachments
                                        ) =>
                                            // handleChange({
                                            //     name: 'attachments',
                                            //     value: selectedList.map(
                                            //         (attachment) => attachment.id
                                            //     ),
                                            // })
                                            dispatch(
                                                setAttachments(
                                                    selectedList.map(
                                                        (attachment) =>
                                                            attachment.id
                                                    )
                                                )
                                            )
                                        }
                                        onSelect={(
                                            selectedList: typeof allAttachments
                                        ) =>
                                            // handleChange({
                                            //     name: 'attachments',
                                            //     value: selectedList.map(
                                            //         (attachment) => attachment.id
                                            //     ),
                                            // })
                                            dispatch(
                                                setAttachments(
                                                    selectedList.map(
                                                        (attachment) =>
                                                            attachment.id
                                                    )
                                                )
                                            )
                                        }
                                        options={allAttachments.map(
                                            (item, index) => ({
                                                ...item,
                                                displayValue: `${index + 1}. ${
                                                    item.name
                                                }`,
                                            })
                                        )}
                                        ref={
                                            multiselectRef
                                                ? (ref) =>
                                                      (multiselectRef.current =
                                                          ref)
                                                : null
                                        }
                                        className="!w-[550px] bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none "
                                    />
                                    {/* {allAttachments.map((attachment, index) => {
                                        return (
                                            <Tag
                                                size={'sm'}
                                                m={'0.25rem'}
                                                p={'0.5rem'}
                                                key={index}
                                                borderRadius="md"
                                                variant="solid"
                                                colorScheme="gray"
                                                _hover={{ cursor: 'pointer' }}
                                                // onClick={() =>
                                                //     // handleChange({
                                                //     //     name: 'message',
                                                //     //     value: `${details.message} ${variable}`,
                                                //     // })
                                                //     dispatch(
                                                //         setMessage(
                                                //             `${details.message} ${variable}`
                                                //         )
                                                //     )
                                                // }
                                            >
                                                <Avatar
                                                    src={attachment.thumbnail}
                                                    size={'xs'}
                                                />
                                                <TagLabel>
                                                    {attachment.filename}
                                                </TagLabel>
                                            </Tag>
                                        );
                                    })} */}
                                    <IconButton
                                        size={'sm'}
                                        colorScheme="green"
                                        backgroundColor={'transparent'}
                                        rounded={'full'}
                                        borderWidth={'1px'}
                                        borderColor={'green.400'}
                                        icon={
                                            <AttachmentIcon
                                                color={'green.400'}
                                            />
                                        }
                                        _hover={{
                                            opacity: 1,
                                            borderColor: 'green.500',
                                        }}
                                        aria-label="Add Attachment"
                                        isLoading={addingAttachment}
                                        onClick={() => {
                                            document
                                                .getElementById(
                                                    'attachment-file-input'
                                                )
                                                ?.click();
                                        }}
                                    />
                                </Flex>
                                <AttachmentDetailsInputDialog
                                    isOpen={isAttachmentDetailsOpen}
                                    onClose={() => {
                                        closeAttachmentDetailsInput();
                                        setAttachmentFile(null);
                                    }}
                                    onConfirm={(
                                        name: string,
                                        caption: string
                                    ) => {
                                        if (!attachmentFile || !name) return;
                                        addAttachment(
                                            name,
                                            caption,
                                            attachmentFile
                                        );
                                        closeAttachmentDetailsInput();
                                    }}
                                    variables={details.variables}
                                />
                                <input
                                    type="file"
                                    name="attachment-file-input"
                                    id="attachment-file-input"
                                    className="invisible h-[1px] w-[1px] absolute"
                                    multiple={false}
                                    ref={(ref) => (fileInputRef.current = ref)}
                                    onInput={handleAttachmentInput}
                                />
                            </Box>
                            <Box flexGrow={1}>
                                <Text
                                    fontSize="xs"
                                    className="text-gray-700 dark:text-gray-400"
                                >
                                    Share Contact
                                </Text>
                                <Button
                                    size={'sm'}
                                    width={'full'}
                                    variant={'outline'}
                                    colorScheme="green"
                                    onClick={openContactInput}
                                >
                                    Create Contact
                                </Button>
                                <ContactDetailInputDialog
                                    isOpen={isContactInputOpen}
                                    onClose={closeContactInput}
                                    onConfirm={handleContactInput}
                                />
                                <Box>
                                    {details.shared_contact_cards.map(
                                        (contact, index) => (
                                            <Tag
                                                size={'sm'}
                                                m={'0.25rem'}
                                                p={'0.5rem'}
                                                key={index}
                                                borderRadius="md"
                                                variant="solid"
                                                colorScheme="gray"
                                            >
                                                <TagLabel>
                                                    {contact.first_name}
                                                </TagLabel>
                                                <TagCloseButton
                                                    onClick={() => {
                                                        removeContact(contact);
                                                    }}
                                                />
                                            </Tag>
                                        )
                                    )}
                                </Box>
                            </Box>

                            {/* {error && (
                <FormErrorMessage mt={-2} textAlign={'center'}>
                    {error}
                </FormErrorMessage>
            )} */}
                            {fileError && (
                                <Text color={'tomato'}>{fileError}</Text>
                            )}
                        </Flex>
                        <FormControl
                            // isInvalid={!!error}
                            display={'flex'}
                            flexDirection={'column'}
                            gap={2}
                            // hidden={isHidden}
                        >
                            <Box justifyContent={'space-between'}>
                                <Text
                                    className="text-gray-700 dark:text-white"
                                    fontWeight={'medium'}
                                    py={4}
                                >
                                    Message Delay
                                </Text>
                                <Flex gap={2}>
                                    <FormControl
                                        isInvalid={!!error.minDelay}
                                        flexGrow={1}
                                    >
                                        <Text
                                            fontSize="sm"
                                            className="text-gray-700 dark:text-white"
                                        >
                                            Minimum Delay (in sec)
                                        </Text>
                                        <Input
                                            width={'full'}
                                            placeholder="5"
                                            rounded={'md'}
                                            border={'none'}
                                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                            _focus={{
                                                border: 'none',
                                                outline: 'none',
                                            }}
                                            type="number"
                                            min={1}
                                            value={details.min_delay.toString()}
                                            onChange={(e) =>
                                                // handleChange({
                                                //     name: 'min_delay',
                                                //     value: Number(e.target.value),
                                                // })
                                                {
                                                    setError((prev) => ({
                                                        ...prev,
                                                        minDelay: '',
                                                    }));
                                                    dispatch(
                                                        setMinDelay(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    );
                                                }
                                            }
                                        />
                                        {error.minDelay && (
                                            <FormErrorMessage>
                                                {error.minDelay}
                                            </FormErrorMessage>
                                        )}
                                    </FormControl>
                                    <FormControl
                                        isInvalid={!!error.maxDelay}
                                        flexGrow={1}
                                    >
                                        <Text
                                            fontSize="sm"
                                            className="text-gray-700 dark:text-white"
                                        >
                                            Maximum Delay (in sec)
                                        </Text>
                                        <Input
                                            width={'full'}
                                            placeholder="55"
                                            rounded={'md'}
                                            border={'none'}
                                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                            _focus={{
                                                border: 'none',
                                                outline: 'none',
                                            }}
                                            type="number"
                                            min={1}
                                            value={details.max_delay.toString()}
                                            onChange={(e) =>
                                                // handleChange({
                                                //     name: 'max_delay',
                                                //     value: Number(e.target.value),
                                                // })
                                                {
                                                    setError((prev) => ({
                                                        ...prev,
                                                        maxDelay: '',
                                                    }));
                                                    dispatch(
                                                        setMaxDelay(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    );
                                                }
                                            }
                                        />
                                        {error.maxDelay && (
                                            <FormErrorMessage>
                                                {error.maxDelay}
                                            </FormErrorMessage>
                                        )}
                                    </FormControl>
                                </Flex>
                            </Box>

                            <Box justifyContent={'space-between'}>
                                <Text
                                    className="text-gray-700 dark:text-white"
                                    fontWeight={'medium'}
                                    pt={4}
                                    pb={2}
                                >
                                    Batch Setting
                                </Text>
                                <Flex gap={2}>
                                    <FormControl
                                        isInvalid={!!error.batchSize}
                                        flexGrow={1}
                                    >
                                        <Text
                                            fontSize="sm"
                                            className="text-gray-700 dark:text-white"
                                        >
                                            Batch Size
                                        </Text>
                                        <Input
                                            width={'full'}
                                            placeholder="5"
                                            rounded={'md'}
                                            border={'none'}
                                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                            _focus={{
                                                border: 'none',
                                                outline: 'none',
                                            }}
                                            type="number"
                                            min={1}
                                            value={details.batch_size.toString()}
                                            onChange={(e) =>
                                                // handleChange({
                                                //     name: 'batch_size',
                                                //     value: Number(e.target.value),
                                                // })
                                                {
                                                    setError((prev) => ({
                                                        ...prev,
                                                        batchSize: '',
                                                    }));
                                                    dispatch(
                                                        setBatchSize(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    );
                                                }
                                            }
                                        />
                                        {error.batchSize && (
                                            <FormErrorMessage>
                                                {error.batchSize}
                                            </FormErrorMessage>
                                        )}
                                    </FormControl>
                                    <FormControl
                                        isInvalid={!!error.batchDelay}
                                        flexGrow={1}
                                    >
                                        <Text
                                            fontSize="sm"
                                            className="text-gray-700 dark:text-white"
                                        >
                                            Batch Delay (in sec)
                                        </Text>
                                        <Input
                                            width={'full'}
                                            placeholder="55"
                                            rounded={'md'}
                                            border={'none'}
                                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                            _focus={{
                                                border: 'none',
                                                outline: 'none',
                                            }}
                                            type="number"
                                            min={1}
                                            value={details.batch_delay.toString()}
                                            onChange={(e) =>
                                                // handleChange({
                                                //     name: 'batch_delay',
                                                //     value: Number(e.target.value),
                                                // })
                                                {
                                                    setError((prev) => ({
                                                        ...prev,
                                                        batchDelay: '',
                                                    }));
                                                    dispatch(
                                                        setBatchDelay(
                                                            Number(
                                                                e.target.value
                                                            )
                                                        )
                                                    );
                                                }
                                            }
                                        />
                                        {error.batchDelay && (
                                            <FormErrorMessage>
                                                {error.batchDelay}
                                            </FormErrorMessage>
                                        )}
                                    </FormControl>
                                </Flex>
                            </Box>

                            <Box justifyContent={'space-between'}>
                                <Text
                                    className="text-gray-700 dark:text-white"
                                    fontWeight={'medium'}
                                    pt={4}
                                    pb={2}
                                >
                                    Schedule Setting
                                </Text>
                                <Flex gap={2}>
                                    <Box flexGrow={1}>
                                        <Text
                                            fontSize="sm"
                                            className="text-gray-700 dark:text-white"
                                        >
                                            Start At (in IST)
                                        </Text>
                                        <Input
                                            type="time"
                                            width={'full'}
                                            placeholder="00:00"
                                            rounded={'md'}
                                            border={'none'}
                                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                            _focus={{
                                                border: 'none',
                                                outline: 'none',
                                            }}
                                            value={details.startTime}
                                            onChange={(e) =>
                                                // handleChange({
                                                //     name: 'startTime',
                                                //     value: e.target.value,
                                                // })
                                                dispatch(
                                                    setStartTime(e.target.value)
                                                )
                                            }
                                        />
                                    </Box>
                                    <Box flexGrow={1}>
                                        <Text
                                            fontSize="sm"
                                            className="text-gray-700 dark:text-white"
                                        >
                                            End At (in IST)
                                        </Text>
                                        <Input
                                            type="time"
                                            width={'full'}
                                            placeholder="23:59"
                                            rounded={'md'}
                                            border={'none'}
                                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                                            _focus={{
                                                border: 'none',
                                                outline: 'none',
                                            }}
                                            value={details.endTime}
                                            onChange={(e) =>
                                                // handleChange({
                                                //     name: 'endTime',
                                                //     value: e.target.value,
                                                // })
                                                dispatch(
                                                    setEndTime(e.target.value)
                                                )
                                            }
                                        />
                                    </Box>
                                </Flex>
                            </Box>
                        </FormControl>
                    </HStack>
                    {error.apiError && (
                        <Text pt={4} color={'tomato'}>
                            {error.apiError}
                        </Text>
                    )}
                    <Button
                        colorScheme="green"
                        variant="solid"
                        width="full"
                        mt={8}
                        onClick={scheduleMessage}
                    >
                        Schedule
                    </Button>
                    <SuccessDialog
                        isOpen={successCampaignCreation}
                        onClose={closeCampaignCreation}
                    />
                </Box>
            </Flex>
        </Flex>
    );
}

const SuccessDialog = ({
    isOpen,
    onClose,
}: {
    onClose: () => void;
    isOpen: boolean;
}) => {
    const cancelRef = useRef<any>();
    return (
        <AlertDialog
            motionPreset="slideInBottom"
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
