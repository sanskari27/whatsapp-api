import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    IconButton,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Switch,
    Text,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';

export type PollInputDialogHandle = {
    open: (
        polls: {
            title: string;
            options: string[];
            isMultiSelect: boolean;
        }[]
    ) => void;
    close: () => void;
};

type Props = {
    onConfirm: (
        polls: {
            title: string;
            options: string[];
            isMultiSelect: boolean;
        }[]
    ) => void;
};

const PollInputDialog = forwardRef<PollInputDialogHandle, Props>(
    ({ onConfirm }: Props, ref) => {
        const [isOpen, setOpen] = useState(false);
        const [polls, setPolls] = useState<
            {
                title: string;
                options: string[];
                isMultiSelect: boolean;
            }[]
        >([
            {
                title: '',
                options: ['', ''],
                isMultiSelect: false,
            },
        ]);

        const [error, setError] = useState<{
            pollIndex: number;
            error: string;
        } | null>(null);

        const onClose = () => {
            setOpen(false);
        };

        useImperativeHandle(ref, () => ({
            open: (
                polls: {
                    title: string;
                    options: string[];
                    isMultiSelect: boolean;
                }[]
            ) => {
                polls.map((poll) => {
                    return {
                        title: poll.title,
                        options: poll.options.map((option) => option),
                        isMultiSelect: poll.isMultiSelect,
                    };
                });
                setOpen(true);
                setError({
                    pollIndex: 0,
                    error: '',
                });
            },
            close: () => {
                setPolls([]);
                setError({
                    pollIndex: 0,
                    error: '',
                });
                setOpen(false);
            },
        }));

        const validatePolls = (
            polls: {
                title: string;
                options: string[];
                isMultiSelect: boolean;
            }[]
        ) => {
            for (let i = 0; i < polls.length; i++) {
                if (polls[i].title.trim() === '') {
                    return setError({
                        pollIndex: i,
                        error: 'Please fill poll title',
                    });
                }
                const filledOptions = polls[i].options.filter(
                    (option) => option.trim() !== ''
                );
                if (filledOptions.length < 2) {
                    return setError({
                        pollIndex: i,
                        error: 'Please at least 2 poll options or remove unused polls',
                    });
                }
            }
            return null;
        };

        const handleAdd = () => {
            if (validatePolls(polls) !== null) {
                return;
            }
            onConfirm(polls);
            onClose();
        };

        const handleCancel = () => {
            onClose();
        };

        const handleAddBlankPoll = () => {
            const newPolls = [...polls];
            newPolls.push({
                title: '',
                options: ['', ''],
                isMultiSelect: false,
            });
            setPolls(newPolls);
        };

        const handleChange = (
            pollIndex: number,
            value: string,
            optionIndex?: number
        ) => {
            setPolls((prev) => {
                console.log(prev);
                if (optionIndex !== undefined) {
                    prev[pollIndex].options[optionIndex] = value;
                } else {
                    prev[pollIndex].title = value;
                }
                return prev;
            });
        };

        const handlePollMultiSelect = (pollIndex: number, value: boolean) => {
            const newPolls = [...polls];
            newPolls[pollIndex].isMultiSelect = value;
            setPolls(newPolls);
        };

        const handleAddOption = (pollIndex: number) => {
            const newPolls = [...polls];
            newPolls[pollIndex].options.push('');
            setPolls(newPolls);
        };

        const handleDeletePollOption = (
            pollIndex: number,
            optionIndex: number
        ) => {
            const newPolls = [...polls];
            newPolls[pollIndex].options.splice(optionIndex, 1);
            setPolls(newPolls);
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} size={'4xl'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>
                        <HStack justifyContent={'space-between'}>
                            <Text>Create Polls</Text>
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="whatsapp"
                                onClick={handleAddBlankPoll}
                            >
                                Add Poll
                            </Button>
                        </HStack>
                    </ModalHeader>
                    <ModalBody>
                        <Accordion allowMultiple>
                            {polls.map((poll, pollIndex) => (
                                <AccordionItem key={pollIndex}>
                                    <AccordionButton>
                                        <Box
                                            as="span"
                                            flex="1"
                                            textAlign="left"
                                        >
                                            Poll {pollIndex + 1}
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    <AccordionPanel pb={4}>
                                        <FormControl
                                            isInvalid={
                                                error?.pollIndex ===
                                                    pollIndex && !!error.error
                                            }
                                        >
                                            <FormLabel>Question</FormLabel>

                                            <Input
                                                placeholder={
                                                    'Enter Poll Question'
                                                }
                                                value={poll.title}
                                                onChange={(e) =>
                                                    handleChange(
                                                        pollIndex,
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <HStack
                                            justifyContent={'space-between'}
                                            py={'1rem'}
                                        >
                                            <Text
                                                fontWeight={'medium'}
                                                mt={'0.5rem'}
                                            >
                                                Options
                                            </Text>
                                            <IconButton
                                                aria-label={'Add Option'}
                                                icon={<AddIcon />}
                                                size={'sm'}
                                                colorScheme="green"
                                                onClick={() =>
                                                    handleAddOption(pollIndex)
                                                }
                                            />
                                        </HStack>
                                        <FormControl
                                            isInvalid={
                                                error?.pollIndex ===
                                                    pollIndex && !!error.error
                                            }
                                        >
                                            {poll.options.map(
                                                (option, optionIndex) => (
                                                    <HStack
                                                        mb={'0.5rem'}
                                                        key={optionIndex}
                                                    >
                                                        <Input
                                                            placeholder={`Enter Option ${
                                                                optionIndex + 1
                                                            }`}
                                                            value={option}
                                                            onChange={(e) => {
                                                                handleChange(
                                                                    pollIndex,
                                                                    e.target
                                                                        .value,
                                                                    optionIndex
                                                                );
                                                            }}
                                                        />
                                                        {optionIndex > 1 && (
                                                            <IconButton
                                                                aria-label={
                                                                    'Delete Option'
                                                                }
                                                                icon={
                                                                    <DeleteIcon />
                                                                }
                                                                colorScheme="red"
                                                                onClick={() =>
                                                                    handleDeletePollOption(
                                                                        pollIndex,
                                                                        optionIndex
                                                                    )
                                                                }
                                                            />
                                                        )}
                                                    </HStack>
                                                )
                                            )}
                                        </FormControl>
                                        <HStack>
                                            <FormControl
                                                display={'flex'}
                                                alignItems={'center'}
                                                pt={'0.5rem'}
                                            >
                                                <FormLabel mb={0}>
                                                    Allow Multiple Selections
                                                </FormLabel>
                                                <Switch
                                                    isChecked={
                                                        poll.isMultiSelect
                                                    }
                                                    onChange={(e) =>
                                                        handlePollMultiSelect(
                                                            pollIndex,
                                                            e.target.checked
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <Button
                                                leftIcon={<DeleteIcon />}
                                                colorScheme="red"
                                                onClick={() =>
                                                    setPolls(
                                                        polls.filter(
                                                            (_, index) =>
                                                                index !==
                                                                pollIndex
                                                        )
                                                    )
                                                }
                                            >
                                                Delete this Poll
                                            </Button>
                                        </HStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </ModalBody>
                    <ModalFooter width={'full'}>
                        {error?.error && (
                            <Text
                                width={'full'}
                                color={'red'}
                                textAlign={'left'}
                            >
                                {error.error}
                            </Text>
                        )}
                        <Button
                            mr={'1rem'}
                            colorScheme="red"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button colorScheme={'green'} onClick={handleAdd}>
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    }
);

export default PollInputDialog;
