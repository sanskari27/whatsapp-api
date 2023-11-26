import { AddIcon, AttachmentIcon } from '@chakra-ui/icons';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogCloseButton,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Flex,
    FormControl,
    FormErrorMessage,
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
import React, { ChangeEvent, useRef, useState } from 'react';
import { SchedulerDetails } from '..';
import useAttachment from '../../../../hooks/useAttachment';
import useTemplate from '../../../../hooks/useTemplate';
import AttachmentDetailsInputDialog from '../../../components/attachment-details-input-dialog';
import ContactDetailInputDialog from '../../../components/contact-detail-input-dialog';

const MessageSection = ({
    details,
    type,
    handleChange,
    error,
    addContact,
    removeContact,
    isHidden,
}: {
    type: 'NUMBERS' | 'CSV' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
    details: {
        message: string;
        variables: string[];
        shared_contact_cards: {
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
        }[];
        attachments: string[];
    };

    handleChange: ({
        name,
        value,
    }: {
        name: keyof SchedulerDetails;
        value: string | number | string[] | undefined;
    }) => Promise<void>;
    addContact: (data: {
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
    }) => void;
    removeContact: (contact: {
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
    }) => void;
    error: string;
    isHidden: boolean;
}) => {
    const { templates, add: addToTemplate, addingTemplate } = useTemplate();
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
        isOpen: isNameInputOpen,
        onOpen: openNameInput,
        onClose: closeNameInput,
    } = useDisclosure();
    const {
        isOpen: isContactInputOpen,
        onOpen: openContactInput,
        onClose: closeContactInput,
    } = useDisclosure();

    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>();

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
        addContact(contactDetails);
        closeContactInput();
    };

    return (
        <FormControl
            isInvalid={!!error}
            display={'flex'}
            flexDirection={'column'}
            gap={2}
            hidden={isHidden}
        >
            <Box justifyContent={'space-between'}>
                <Text
                    fontSize="xs"
                    className="text-gray-700 dark:text-gray-400"
                >
                    Select Template
                </Text>
                <Flex gap={3} alignItems={'center'}>
                    <Select
                        className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                        border={'none'}
                        size={'sm'}
                        rounded={'md'}
                        onChange={(e) =>
                            handleChange({
                                name: 'message',
                                value: e.target.value,
                            })
                        }
                    >
                        <option
                            className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                            value={''}
                        >
                            Select template!
                        </option>
                        {(templates ?? []).map(({ name, message }, index) => (
                            <option
                                className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
                                value={message}
                                key={index}
                            >
                                {name}
                            </option>
                        ))}
                    </Select>
                    <IconButton
                        size={'sm'}
                        colorScheme="green"
                        aria-label="Add Template"
                        rounded={'md'}
                        icon={<AddIcon />}
                        isLoading={addingTemplate}
                        onClick={() => {
                            if (!details.message) return;
                            openNameInput();
                        }}
                    />
                    <InputDialog
                        isOpen={isNameInputOpen}
                        onClose={closeNameInput}
                        onConfirm={(name) => {
                            if (!details.message) return;
                            addToTemplate(name, details.message);
                            closeNameInput();
                        }}
                    />
                </Flex>
            </Box>
            <Box>
                <Textarea
                    width={'full'}
                    minHeight={'80px'}
                    size={'sm'}
                    rounded={'md'}
                    placeholder={
                        type === 'CSV'
                            ? 'Type your message here. \nex. Hello {{name}}, you are invited to join fanfest on {{date}}'
                            : 'Type your message here. \nex. You are invited to join fanfest'
                    }
                    border={'none'}
                    className="text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]"
                    _placeholder={{ opacity: 0.4, color: 'inherit' }}
                    _focus={{ border: 'none', outline: 'none' }}
                    value={details.message ?? ''}
                    onChange={(e) =>
                        handleChange({ name: 'message', value: e.target.value })
                    }
                />
            </Box>

            <Box hidden={type !== 'CSV'}>
                <Text
                    fontSize="xs"
                    className="text-gray-700 dark:text-gray-400"
                >
                    Variables
                </Text>
                <Box>
                    {details.variables.map((variable, index) => (
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
                                handleChange({
                                    name: 'message',
                                    value: `${details.message} ${variable}`,
                                })
                            }
                        >
                            <TagLabel>{variable}</TagLabel>
                        </Tag>
                    ))}
                </Box>
            </Box>
            <Box>
                <Text
                    fontSize="xs"
                    className="text-gray-700 dark:text-gray-400"
                >
                    Attachments
                </Text>
                <Flex gap={2} alignItems={'center'}>
                    <Multiselect
                        displayValue="displayValue"
                        placeholder={'Select Attachments'}
                        onRemove={(selectedList: typeof allAttachments) =>
                            handleChange({
                                name: 'attachments',
                                value: selectedList.map(
                                    (attachment) => attachment.id
                                ),
                            })
                        }
                        onSelect={(selectedList: typeof allAttachments) =>
                            handleChange({
                                name: 'attachments',
                                value: selectedList.map(
                                    (attachment) => attachment.id
                                ),
                            })
                        }
                        showCheckbox={true}
                        hideSelectedList={true}
                        options={allAttachments.map((item, index) => ({
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
                        className="!w-[370px] bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none "
                    />
                    <IconButton
                        size={'sm'}
                        colorScheme="green"
                        backgroundColor={'transparent'}
                        rounded={'full'}
                        borderWidth={'1px'}
                        borderColor={'green.400'}
                        icon={<AttachmentIcon color={'green.400'} />}
                        _hover={{
                            opacity: 1,
                            borderColor: 'green.500',
                        }}
                        aria-label="Add Attachment"
                        isLoading={addingAttachment}
                        onClick={() => {
                            document
                                .getElementById('attachment-file-input')
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
                    onConfirm={(name: string, caption: string) => {
                        if (!attachmentFile || !name) return;
                        addAttachment(name, caption, attachmentFile);
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
                    {details.shared_contact_cards.map((contact, index) => (
                        <Tag
                            size={'sm'}
                            m={'0.25rem'}
                            p={'0.5rem'}
                            key={index}
                            borderRadius="md"
                            variant="solid"
                            colorScheme="gray"
                        >
                            <TagLabel>{contact.first_name}</TagLabel>
                            <TagCloseButton
                                onClick={() => {
                                    removeContact(contact);
                                }}
                            />
                        </Tag>
                    ))}
                </Box>
            </Box>

            {error && (
                <FormErrorMessage mt={-2} textAlign={'center'}>
                    {error}
                </FormErrorMessage>
            )}
            {fileError && <Text color={'tomato'}>{fileError}</Text>}
        </FormControl>
    );
};

const InputDialog = ({
    isOpen,
    onConfirm,
    onClose,
}: {
    onClose: () => void;
    onConfirm: (text: string) => void;
    isOpen: boolean;
}) => {
    const [name, setName] = React.useState('');
    const cancelRef = React.useRef<any>();
    return (
        <AlertDialog
            motionPreset="slideInBottom"
            leastDestructiveRef={cancelRef}
            onClose={onClose}
            isOpen={isOpen}
            isCentered
        >
            <AlertDialogOverlay />

            <AlertDialogContent width={'80%'}>
                <AlertDialogHeader fontSize={'sm'}>
                    Assign a name.
                </AlertDialogHeader>
                <AlertDialogCloseButton />
                <AlertDialogBody>
                    <Input
                        width={'full'}
                        placeholder={'template name...'}
                        border={'none'}
                        className="text-black !bg-[#ECECEC] "
                        _placeholder={{ opacity: 0.4, color: 'inherit' }}
                        _focus={{ border: 'none', outline: 'none' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </AlertDialogBody>
                <AlertDialogFooter>
                    <Button
                        ref={cancelRef}
                        colorScheme="red"
                        onClick={onClose}
                        size={'sm'}
                    >
                        Cancel
                    </Button>
                    <Button
                        colorScheme="green"
                        onClick={() => onConfirm(name)}
                        ml={3}
                        size={'sm'}
                    >
                        Save
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default MessageSection;
