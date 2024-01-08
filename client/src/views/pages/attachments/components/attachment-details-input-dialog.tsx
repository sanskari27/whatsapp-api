import {
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
	Textarea,
} from '@chakra-ui/react';
import { forwardRef, useImperativeHandle, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AttachmentService from '../../../../services/attachment.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addAttachment,
	clearSelectedAttachment,
	setCaption,
	setCustomCaption,
	setError,
	setName,
	startAttachmentSaving,
	updateAttachment,
} from '../../../../store/reducers/AttachmentReducers';

export type AttachmentDetailsInputDialogHandle = {
	close: () => void;
	open: () => void;
};

const AttachmentDetailsInputDialog = forwardRef<AttachmentDetailsInputDialogHandle>((_, ref) => {
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

	const handleAddAttachment = () => {
		if (!name) {
			dispatch(setError('Please enter a file name'));
			return;
		}

		if (isUpdating) {
			dispatch(startAttachmentSaving());
			AttachmentService.updateAttachmentDetails(selectedAttachment).then((res) => {
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
			AttachmentService.uploadAttachment(file, name, caption, custom_caption).then((res) => {
				if (!res) return;
				dispatch(addAttachment(res));
				setOpen(false);
			});
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Add Attachment</ModalHeader>
				<ModalBody pb={6}>
					<FormControl isInvalid={!!errorMessage}>
						<FormLabel>File name</FormLabel>
						<Input
							placeholder='file name'
							value={name ?? ''}
							onChange={(e) => dispatch(setName(e.target.value))}
						/>
					</FormControl>

					<FormControl mt={4}>
						<HStack alignItems={'center'} justifyContent={'space-between'} pb={'0.5rem'}>
							<FormLabel>Caption</FormLabel>
							{/* <HStack>
                                    <IconButton
                                        isRound={true}
                                        variant="solid"
                                        aria-label="Done"
                                        size="xs"
                                        icon={
                                            custom_caption ? (
                                                <CheckIcon color="white" />
                                            ) : (
                                                <></>
                                            )
                                        }
                                        onClick={() => {
                                            dispatch(
                                                setCustomCaption(
                                                    !custom_caption
                                                )
                                            );
                                        }}
                                        className={`${
                                            custom_caption
                                                ? '!bg-[#4CB072]'
                                                : 'bg-green-500' ||
                                                  '!bg-[#A6A6A6] dark:!bg-[#252525]'
                                        } hover:!bg-green-700 `}
                                    />
                                    <Text
                                        className="text-black dark:text-white"
                                        fontSize="sm"
                                    >
                                        Custom Caption
                                    </Text>
                                </HStack> */}
							<Button
								size={'sm'}
								onClick={() => {
									dispatch(setCustomCaption(!custom_caption));
								}}
								variant={custom_caption ? 'solid' : 'outline'}
								colorScheme='telegram'
							>
								Custom Caption
							</Button>
						</HStack>
						<Textarea
							placeholder={`Enter caption here\r\nAdd variable like {{variable name}}`}
							value={caption ?? ''}
							onChange={(e) => dispatch(setCaption(e.target.value))}
						/>
						<Button
							mt={'1rem'}
							size={'sm'}
							onClick={() => {
								dispatch(setCaption(`${caption} {{variable name}}`));
							}}
							variant={'outline'}
							colorScheme='blue'
						>
							Add a variable
						</Button>
					</FormControl>
				</ModalBody>

				<ModalFooter>
					<Button colorScheme='whatsapp' mr={3} onClick={handleAddAttachment} isLoading={isSaving}>
						Save
					</Button>
					<Button onClick={onClose} colorScheme='red'>
						Cancel
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
});

export default AttachmentDetailsInputDialog;
