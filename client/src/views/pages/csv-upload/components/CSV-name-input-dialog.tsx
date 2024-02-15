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
	HStack,
	Input,
	Text,
	useToast,
} from '@chakra-ui/react';
import React, { forwardRef, useImperativeHandle } from 'react';
import Dropzone from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import UploadsService from '../../../../services/uploads.service';
import { StoreNames, StoreState } from '../../../../store';
import {
	addCsvFileList,
	setError,
	setFile,
	setName,
	startSaving,
	stopSaving,
} from '../../../../store/reducers/CSVFileReducers';

export type CSVNameInputDialogHandle = {
	open: () => void;
	close: () => void;
};

const CSVNameInputDialog = forwardRef<CSVNameInputDialogHandle>((_, ref) => {
	const dispatch = useDispatch();
	const toast = useToast();

	const cancelRef = React.useRef<HTMLButtonElement>(null);

	const [isOpen, setIsOpen] = React.useState(false);

	const {
		selectedCSV: { name },
		csvFile,
		uiDetails: { error, isSaving },
	} = useSelector((state: StoreState) => state[StoreNames.CSV]);

	useImperativeHandle(ref, () => ({
		open: () => {
			setIsOpen(true);
		},
		close: () => {
			setIsOpen(false);
		},
	}));

	function handleCSVUpload() {
		if (!csvFile) return;
		dispatch(startSaving());

		UploadsService.uploadCSV({ file: csvFile, name })
			.then((res) => {
				dispatch(startSaving());
				if (res.name === 'ERROR') {
					dispatch(setError(res.id));
					toast({
						title: res.id,
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
				setIsOpen(false);
				toast({
					title: 'Uploaded successfully.',
					description: 'CSV has been uploaded successfully.',
					status: 'success',
					duration: 5000,
					isClosable: true,
				});
			})
			.finally(() => {
				dispatch(stopSaving());
			});
	}

	return (
		<AlertDialog
			motionPreset='slideInBottom'
			leastDestructiveRef={cancelRef}
			onClose={() => setIsOpen(false)}
			isOpen={isOpen}
			isCentered
		>
			<AlertDialogOverlay />

			<AlertDialogContent width={'80%'}>
				<AlertDialogHeader fontSize={'sm'}>Upload CSV file.</AlertDialogHeader>
				<AlertDialogCloseButton />
				<AlertDialogBody>
					<Dropzone
						onDropAccepted={(acceptedFile) => {
							dispatch(setFile(acceptedFile[0]));
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
								borderColor={'gray'}
								borderStyle={'dashed'}
								borderRadius={'lg'}
								py={'3rem'}
								textAlign={'center'}
								textColor={'gray'}
							>
								<input {...getInputProps()} />
								<Text>Drag and drop file here, or click to select files</Text>
							</Box>
						)}
					</Dropzone>
					{csvFile?.name && (
						<Text mt={'1rem'} fontSize={'sm'}>
							{csvFile.name}
						</Text>
					)}
					<Input
						mt={'1rem'}
						width={'full'}
						placeholder={'ex. fanfest audience list'}
						border={'none'}
						className='text-black !bg-[#ECECEC] '
						_placeholder={{ opacity: 0.4, color: 'inherit' }}
						_focus={{ border: 'none', outline: 'none' }}
						value={name ?? ''}
						onChange={(e) => {
							dispatch(setName(e.target.value));
						}}
					/>
				</AlertDialogBody>
				<AlertDialogFooter>
					<HStack justifyContent={'space-between'} width={'full'}>
						<Box>
							{error && (
								<Text fontSize={'sm'} color={'red'} textAlign={'center'}>
									{error}
								</Text>
							)}
						</Box>
						<HStack>
							<Button
								ref={cancelRef}
								colorScheme='red'
								onClick={() => setIsOpen(false)}
								size={'sm'}
							>
								Cancel
							</Button>
							<Button
								colorScheme='green'
								onClick={handleCSVUpload}
								ml={3}
								size={'sm'}
								isLoading={isSaving}
							>
								Save
							</Button>
						</HStack>
					</HStack>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
});

export default CSVNameInputDialog;
