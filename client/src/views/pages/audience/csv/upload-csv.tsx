import {
	Box,
	Button,
	Flex,
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
	VStack,
	useDisclosure,
	useToast,
} from '@chakra-ui/react';
import Dropzone from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Colors, NAVIGATION } from '../../../../config/const';
import UploadsService from '../../../../services/uploads.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addCsvFileList,
	clearSelectedCSVFile,
	removeFile,
	setError,
	setFile,
	setName,
	startSaving,
	stopSaving,
} from '../../../../store/reducers/CSVFileReducers';

export default function UploadCSV() {
	const dispatch = useDispatch();
	const toast = useToast();
	const navigate = useNavigate();

	const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true });

	const {
		selectedCSV: { name },
		csvFile,
		size,
		uiDetails: { isSaving },
	} = useSelector((state: StoreState) => state[StoreNames.CSV]);

	const handleClose = () => {
		dispatch(clearSelectedCSVFile());
		navigate(NAVIGATION.AUDIENCE + NAVIGATION.CSV);
	};

	async function handleCSVUpload() {
		if (!csvFile) return;
		if (!name) return;
		dispatch(startSaving());
		const res = await UploadsService.uploadCSV({ file: csvFile, name });

		dispatch(stopSaving());
		if (res.name === 'ERROR') {
			toast({
				title: res.fileName,
				status: 'error',
				duration: 5000,
				isClosable: true,
			});
			setTimeout(() => {
				dispatch(setError(''));
			}, 5000);
			return;
		}
		dispatch(addCsvFileList(res));
		handleClose();
		toast({
			title: 'Uploaded successfully.',
			description: 'CSV has been uploaded successfully.',
			status: 'success',
			duration: 5000,
			isClosable: true,
		});
	}

	const handleFileInput = (file: File) => {
		if (file === null) return;
		if (file.size > 62914560) return dispatch(setError('File size should be less than 60MB'));
		const fileSizeBytes = file.size;

		const fileSizeKB = fileSizeBytes / 1024; // Convert bytes to kilobytes
		const fileSizeMB = fileSizeKB / 1024;

		dispatch(
			setFile({
				file,
				size: fileSizeMB > 1 ? `${fileSizeMB.toFixed(2)} MB` : `${fileSizeKB.toFixed(2)} KB`,
			})
		);
	};

	const removeSelectedFile = () => {
		dispatch(removeFile());
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
				<ModalHeader>Upload CSV</ModalHeader>
				<ModalBody pb={6}>
					<FormControl>
						<FormLabel>File name</FormLabel>
						<Input
							placeholder='file name'
							value={name ?? ''}
							onChange={(e) => dispatch(setName(e.target.value))}
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

					<Box mt={'1.5rem'}>
						{!csvFile ? (
							<DropzoneElement onFileInput={handleFileInput} isInvalid={false} />
						) : (
							<VStack alignItems={'stretch'} gap='0.5rem'>
								<Text>Selected file : {csvFile.name}</Text>
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
							</VStack>
						)}
					</Box>
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
						<Button colorScheme='green' onClick={handleCSVUpload} isLoading={isSaving}>
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
					<input {...getInputProps()} accept='text/csv' />
					<Text>Drag and drop file here, or click to select files</Text>
				</Box>
			)}
		</Dropzone>
	);
}
