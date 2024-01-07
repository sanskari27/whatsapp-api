import {
    Box,
    Button,
    FormControl,
    FormLabel,
    HStack,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import AttachmentService from '../../../../services/attachment.service';
import { StoreNames, StoreState } from '../../../../store';
import {
    addAttachment,
    clearSelectedAttachment,
    setCaption,
    setCustomCaption,
    setError,
    setFile,
    setName,
    startAttachmentSaving,
    updateAttachment,
} from '../../../../store/reducers/AttachmentReducers';

export type AttachmentDetailsInputDialogHandle = {
    close: () => void;
    open: () => void;
};

const AttachmentDetailsInputDialog =
    forwardRef<AttachmentDetailsInputDialogHandle>((_, ref) => {
        const dispatch = useDispatch();
        const [isOpen, setOpen] = useState(false);

        const { selectedAttachment, file, uiDetails } = useSelector(
            (state: StoreState) => state[StoreNames.ATTACHMENT]
        );

        const { caption, custom_caption, name } = selectedAttachment;

        const { errorMessage, isSaving, isUpdating } = uiDetails;

        const onClose = () => {
            dispatch(clearSelectedAttachment());
            setOpen(false);
        };

        useImperativeHandle(ref, () => ({
            close: () => {
                dispatch(clearSelectedAttachment());
                setOpen(false);
            },
            open: () => {
                setOpen(true);
            },
        }));

        const handleAttachmentInput = (files: File) => {
            if (files === null) return;
            if (files.size > 62914560)
                return dispatch(setError('File size should be less than 60MB'));
            dispatch(setFile(files));
        };

        const handleAddAttachment = async () => {
            if (!name) {
                dispatch(setError('Please enter a file name'));
                return;
            }

            if (isUpdating) {
                dispatch(startAttachmentSaving());
                if (file) {
                    await AttachmentService.updateAttachmentFile(
                        selectedAttachment.id,
                        file
                    ).then((res) => {
                        if (!res) return;
                    });
                }
                await AttachmentService.updateAttachmentDetails(
                    selectedAttachment
                ).then((res) => {
                    if (!res) return;
                    dispatch(updateAttachment(res));
                    setOpen(false);
                });
            } else {
                if (!file) {
                    dispatch(setError('Please select a file'));
                    return;
                }
                dispatch(startAttachmentSaving());
                AttachmentService.uploadAttachment(
                    file,
                    name,
                    caption,
                    custom_caption
                ).then((res) => {
                    if (!res) return;
                    dispatch(addAttachment(res));
                    setOpen(false);
                });
            }
        };

        return (
            <Modal isOpen={isOpen} onClose={onClose} size={'2xl'}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Add Attachment</ModalHeader>
                    <ModalBody pb={6}>
                        <Dropzone
                            onDropAccepted={(acceptedFile) => {
                                handleAttachmentInput(acceptedFile[0]);
                            }}
                            maxSize={62914560}
                            onDropRejected={() =>
                                dispatch(
                                    setError(
                                        'File size should be less than 60MB'
                                    )
                                )
                            }
                            multiple={false}
                            onError={(err) => {
                                dispatch(setError(err.message));
                            }}
                        >
                            {({ getRootProps, getInputProps }) => (
                                <Box
                                    {...getRootProps()}
                                    borderWidth={'1px'}
                                    borderColor={'gray'}
                                    borderStyle={'dashed'}
                                    borderRadius={'lg'}
                                    py={'3rem'}
                                    textAlign={'center'}
                                    textColor={'gray'}
                                >
                                    <input {...getInputProps()} />
                                    <Text>
                                        Drag and drop file here, or click to
                                        select files
                                    </Text>
                                </Box>
                            )}
                        </Dropzone>
                        {file && (
                            <Text mt={'0.5rem'}>
                                Selected file : {file.name}
                            </Text>
                        )}
                        <FormControl isInvalid={!!errorMessage} pt={'1rem'}>
                            <FormLabel>File name</FormLabel>
                            <Input
                                placeholder="file name"
                                value={name ?? ''}
                                onChange={(e) =>
                                    dispatch(setName(e.target.value))
                                }
                            />
                        </FormControl>

                        <FormControl mt={4}>
                            <HStack
                                alignItems={'center'}
                                justifyContent={'space-between'}
                                pb={'0.5rem'}
                            >
                                <FormLabel>Caption</FormLabel>
                                <Button
                                    size={'sm'}
                                    onClick={() => {
                                        dispatch(
                                            setCustomCaption(!custom_caption)
                                        );
                                    }}
                                    variant={
                                        custom_caption ? 'solid' : 'outline'
                                    }
                                    colorScheme="telegram"
                                >
                                    Custom Caption
                                </Button>
                            </HStack>
                            <Textarea
                                placeholder={`Enter caption here\r\nAdd variable like {{variable name}}`}
                                value={caption ?? ''}
                                onChange={(e) =>
                                    dispatch(setCaption(e.target.value))
                                }
                            />
                            <Button
                                mt={'1rem'}
                                size={'sm'}
                                onClick={() => {
                                    dispatch(
                                        setCaption(
                                            `${caption} {{variable name}}`
                                        )
                                    );
                                }}
                                variant={'outline'}
                                colorScheme="blue"
                            >
                                Add a variable
                            </Button>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button
                            colorScheme="whatsapp"
                            mr={3}
                            onClick={handleAddAttachment}
                            isLoading={isSaving}
                        >
                            Save
                        </Button>
                        <Button onClick={onClose} colorScheme="red">
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        );
    });

export default AttachmentDetailsInputDialog;
