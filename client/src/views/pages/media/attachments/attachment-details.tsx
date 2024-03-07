import { CheckIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Flex,
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
	Select,
	Text,
	Textarea,
	VStack,
	useDisclosure,
	useToast,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import AttachmentService from '../../../../services/attachment.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addAttachment,
	clearSelectedAttachment,
	findAttachmentById,
	removeFile,
	setCaption,
	setCustomCaption,
	setError,
	setFile,
	setName,
	startAttachmentSaving,
	startAttachmentUpdating,
	updateAttachment,
} from '../../../../store/reducers/AttachmentReducers';
import ProgressBar, { ProgressBarHandle } from '../../../components/progress-bar';
import Variables from '../../../components/variables';
import Preview from './preview.component';

export default function AttachmentDetails() {
	const dispatch = useDispatch();
	const toast = useToast();
	const navigate = useNavigate();
	const progressRef = useRef<ProgressBarHandle>(null);
	const captionRef = useRef<HTMLTextAreaElement>(null);
	const { id } = useParams();

	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

	const { selectedAttachment, file, uiDetails, size, type, url } = useSelector(
		(state: StoreState) => state[StoreNames.ATTACHMENT]
	);

	const { list } = useSelector((state: StoreState) => state[StoreNames.CSV]);

	const { caption, custom_caption, name } = selectedAttachment;

	const { errorMessage, isSaving, isUpdating } = uiDetails;

	const [selectedCSV, setSelectedCSV] = useState<{
		id: string;
		name: string;
		headers: string[];
	}>({
		id: '',
		name: '',
		headers: [],
	});

	useEffect(() => {
		if (!id) return;
		dispatch(startAttachmentUpdating());
		dispatch(findAttachmentById(id));
	}, [id, dispatch]);

	const handleClose = () => {
		dispatch(clearSelectedAttachment());
		navigate(NAVIGATION.MEDIA + NAVIGATION.ATTACHMENTS);
	};

	const handleSelectCSV = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const csv = list.find((item) => item.id === e.target.value);
		if (csv) {
			setSelectedCSV(csv);
		}
	};

	const setVariables = (header: string) => {
		dispatch(
			setCaption(
				caption.substring(0, captionRef.current?.selectionStart) +
					header +
					caption.substring(captionRef.current?.selectionEnd ?? 0, caption.length)
			)
		);
	};

	const handleAttachmentInput = (file: File) => {
		console.log(file);

		if (file === null) return;
		if (file.size > 62914560) return dispatch(setError('File size should be less than 60MB'));
		const url = window.URL.createObjectURL(file);
		const fileSizeBytes = file.size;

		const fileSizeKB = fileSizeBytes / 1024; // Convert bytes to kilobytes
		const fileSizeMB = fileSizeKB / 1024;

		let type = '';

		if (file.type.includes('image')) {
			type = 'image';
		} else if (file.type.includes('video')) {
			type = 'video';
		} else if (file.type.includes('pdf')) {
			type = 'PDF';
		}

		dispatch(
			setFile({
				file,
				type,
				size: fileSizeMB > 1 ? `${fileSizeMB.toFixed(2)} MB` : `${fileSizeKB.toFixed(2)} KB`,
				url,
			})
		);
	};

	const onUploadProgress = (progressEvent: number) => {
		progressRef.current?.setProgressValue(progressEvent);
	};

	const removeSelectedFile = () => {
		dispatch(removeFile());
	};

	const handleAddAttachment = async () => {
		if (!name) {
			dispatch(setError('NAME'));
			return;
		}

		if (isUpdating) {
			dispatch(startAttachmentSaving());
			if (file) {
				await AttachmentService.updateAttachmentFile(selectedAttachment.id, file);
			}
			const res = await AttachmentService.updateAttachmentDetails(selectedAttachment);
			if (!res) {
				toast({
					title: 'Error',
					description: 'Error while updating attachment',
					status: 'error',
					duration: 5000,
					isClosable: true,
				});
				return;
			}
			dispatch(updateAttachment(res));
			toast({
				title: 'Updated',
				description: 'Attachment updated successfully',
				status: 'success',
				duration: 5000,
				isClosable: true,
			});
		} else {
			if (!file) {
				dispatch(setError('FILE'));
				return;
			}
			dispatch(startAttachmentSaving());
			const res = await AttachmentService.uploadAttachment(
				file,
				name,
				caption,
				custom_caption,
				onUploadProgress
			);
			if (!res) {
				toast({
					title: 'Error',
					description: 'Error while uploading attachment',
					status: 'error',
					duration: 5000,
					isClosable: true,
				});
				return;
			}
			dispatch(addAttachment(res.data.attachment));
			toast({
				title: 'Uploaded',
				description: 'Attachment uploaded successfully',
				status: 'success',
				duration: 5000,
				isClosable: true,
			});
		}
		handleClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size={'xl'}
			closeOnOverlayClick={!isSaving}
			scrollBehavior='inside'
			onCloseComplete={handleClose}
		>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>{isUpdating ? 'Update Attachment' : 'Add Attachment'}</ModalHeader>
				<ModalBody pb={6}>
					<FormControl isInvalid={errorMessage === 'NAME'}>
						<FormLabel>File name</FormLabel>
						<Input
							placeholder='file name'
							value={name ?? ''}
							onChange={(e) => dispatch(setName(e.target.value))}
							borderColor={errorMessage === 'NAME' ? 'red.500' : Colors.ACCENT_DARK}
							borderWidth={'1px'}
							padding={'0.5rem'}
							marginTop={'-0.5rem'}
							variant='unstyled'
							_placeholder={{
								color: errorMessage ? 'red.500' : Colors.ACCENT_DARK,
								opacity: 0.7,
							}}
						/>
					</FormControl>

					<FormControl mt={4}>
						<HStack alignItems={'center'} justifyContent={'space-between'} pb={'0.5rem'}>
							<FormLabel>Caption</FormLabel>
							<Flex gap={2} alignItems={'center'}>
								<IconButton
									isRound={true}
									variant='solid'
									aria-label='Done'
									size='xs'
									icon={custom_caption ? <CheckIcon color='white' /> : <></>}
									onClick={() => {
										dispatch(setCustomCaption(!custom_caption));
									}}
									colorScheme={custom_caption ? 'green' : 'gray'}
								/>
								<Text className='text-black ' fontSize='sm'>
									Custom Caption
								</Text>
							</Flex>
						</HStack>
						<Textarea
							ref={captionRef}
							placeholder={`Enter caption here\r\nAdd variable like {{variable name}}`}
							value={caption ?? ''}
							onChange={(e) => dispatch(setCaption(e.target.value))}
							borderColor={Colors.ACCENT_DARK}
							borderWidth={'1px'}
							padding={'0.5rem'}
							marginTop={'-0.5rem'}
							variant='unstyled'
							_placeholder={{
								color: Colors.ACCENT_DARK,
								opacity: 0.7,
							}}
						/>
					</FormControl>
					{custom_caption && (
						<>
							<FormControl pt={'1rem'}>
								<FormLabel>Select CSV for Headers</FormLabel>
								<HStack>
									<Select value={selectedCSV?.id} onChange={handleSelectCSV}>
										<option>Select CSV</option>
										{list.map((item, index) => {
											return (
												<option value={item.fileName} key={index}>
													{item.name}
												</option>
											);
										})}
									</Select>
								</HStack>
							</FormControl>
							<Variables
								data={selectedCSV?.headers ?? []}
								onVariableSelect={setVariables}
								marginTop={'1rem'}
							/>
						</>
					)}
					<Box mt={'1.5rem'}>
						{!file ? (
							<>
								<DropzoneElement
									onFileInput={handleAttachmentInput}
									isInvalid={errorMessage === 'FILE'}
								/>
								<Text textAlign={'center'} fontSize={'xs'}>
									*File size should be less than 60MB
								</Text>
							</>
						) : (
							<VStack alignItems={'stretch'} gap='0.5rem'>
								<Text>Selected file : {file.name}</Text>
								<Flex alignItems={'center'} justifyContent={'space-between'}>
									<Text>Selected file size : {size}</Text>
									<Text
										textColor={'red.400'}
										fontWeight={'normal'}
										cursor={'pointer'}
										onClick={removeSelectedFile}
									>
										Remove
									</Text>
								</Flex>
								<Preview data={{ type, url }} progress={-1} />
							</VStack>
						)}
					</Box>
					<ProgressBar ref={progressRef} />
				</ModalBody>

				<ModalFooter>
					<HStack width={'full'} justifyContent={'flex-end'}>
						<Button
							onClick={handleClose}
							colorScheme='red'
							variant={'outline'}
							isDisabled={isSaving}
						>
							Cancel
						</Button>
						<Button colorScheme='green' onClick={handleAddAttachment} isLoading={isSaving}>
							Save
						</Button>
					</HStack>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

function DropzoneElement({
	onFileInput,
	isInvalid,
}: {
	isInvalid: boolean;
	onFileInput: (file: File) => void;
}) {
	const dispatch = useDispatch();
	return (
		<Dropzone
			onDropAccepted={(acceptedFile) => {
				onFileInput(acceptedFile[0]);
			}}
			maxSize={62914560}
			onDropRejected={() => dispatch(setError('File size should be less than 60MB'))}
			multiple={false}
			onError={(err) => {
				dispatch(setError(err.message));
			}}
		>
			{({ getRootProps, getInputProps }) => (
				<Box
					{...getRootProps()}
					borderWidth={'1px'}
					borderColor={isInvalid ? 'red.500' : Colors.ACCENT_DARK}
					borderStyle={'dashed'}
					borderRadius={'lg'}
					py={'3rem'}
					textAlign={'center'}
					textColor={isInvalid ? 'red.300' : Colors.PRIMARY_DARK}
				>
					<input {...getInputProps()} />
					<Text>Drag and drop file here, or click to select files</Text>
				</Box>
			)}
		</Dropzone>
	);
}
