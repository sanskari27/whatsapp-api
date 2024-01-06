import { EditIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Checkbox,
	HStack,
	Icon,
	IconButton,
	Table,
	TableContainer,
	Tbody,
	Td,
	Text,
	Th,
	Thead,
	Tooltip,
	Tr,
} from '@chakra-ui/react';
import React, { ChangeEvent } from 'react';
import { MdDelete, MdOutlineAttachment } from 'react-icons/md';
import { RiAttachment2 } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../hooks/useTheme';
import AttachmentService from '../../../services/attachment.service';
import { StoreNames, StoreState } from '../../../store';
import {
	clearSelectedAttachment,
	deleteAttachment,
	findAttachmentById,
	setError,
	setFile,
	startAttachmentDeleting,
	startAttachmentUpdating,
} from '../../../store/reducers/AttachmentReducers';
import ConfirmationDialog, { ConfirmationDialogHandle } from '../../components/confirmation-alert';
import AttachmentDetailsInputDialog, {
	AttachmentDetailsInputDialogHandle,
} from './components/attachment-details-input-dialog';

const AttachmentPage = () => {
	const dispatch = useDispatch();
	const theme = useTheme();

	const fileInputRef = React.useRef<HTMLInputElement | null>();
	const AttachmentDetailsInputRef = React.useRef<AttachmentDetailsInputDialogHandle>(null);
	const confirmationDialogRef = React.useRef<ConfirmationDialogHandle>(null);

	const { attachments, uiDetails, file, selectedAttachment } = useSelector(
		(state: StoreState) => state[StoreNames.ATTACHMENT]
	);

	const { isDeleting, isUpdating } = uiDetails;

	const [selectedAttachments, setSelectedAttachments] = React.useState<string[]>([]);

	const addRemoveSelectedAttachments = (id: string) => {
		if (selectedAttachments.includes(id)) {
			setSelectedAttachments((prev) => prev.filter((i) => i !== id));
		} else {
			setSelectedAttachments((prev) => [...prev, id]);
		}
	};

	const handleDeleteAttachments = async () => {
		dispatch(startAttachmentDeleting());
		selectedAttachments.forEach(async (attachment_id) => {
			AttachmentService.deleteAttachment(attachment_id);
			dispatch(deleteAttachment({ id: attachment_id as string }));
		});
		dispatch(clearSelectedAttachment());
		setSelectedAttachments([]);
	};

	const handleAttachmentInput = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files === null) return;
		if (files.length === 0) return;
		if (files[0] === null) return;
		if (files[0].size > 62914560) return dispatch(setError('File size should be less than 60MB'));
		dispatch(setFile(files[0]));
		if (fileInputRef.current) fileInputRef.current.value = '';
		if (isUpdating) {
			AttachmentService.updateAttachmentFile(selectedAttachment.id, file as File, (progress) => {
				console.log(progress);
			});
			return;
		}
		AttachmentDetailsInputRef.current?.open();
	};

	const handleAttachmentDetailsEdit = (id: string) => {
		dispatch(startAttachmentUpdating());
		dispatch(findAttachmentById({ id }));
		AttachmentDetailsInputRef.current?.open();
	};

	const handleFileChange = () => {
		dispatch(startAttachmentUpdating());
		document.getElementById('attachment-file-input')?.click();
	};

	return (
		<Box py={'1rem'}>
			<HStack px={4}>
				<HStack width={'full'}>
					<Icon as={RiAttachment2} height={5} width={5} color={'green.400'} />
					<Text textColor={theme === 'dark' ? 'white' : 'black'} fontSize={'xl'}>
						Attachments
					</Text>
				</HStack>
				<HStack>
					<Button
						leftIcon={<Icon as={MdOutlineAttachment} height={5} width={5} />}
						colorScheme={'green'}
						variant={'solid'}
						size={'sm'}
						onClick={() => {
							document.getElementById('attachment-file-input')?.click();
						}}
					>
						Add Attachment
					</Button>
					<input
						type='file'
						name='attachment-file-input'
						id='attachment-file-input'
						className='invisible h-[1px] absolute'
						multiple={false}
						ref={(ref) => (fileInputRef.current = ref)}
						onInput={handleAttachmentInput}
					/>
					<AttachmentDetailsInputDialog ref={AttachmentDetailsInputRef} />
					<Button
						leftIcon={<Icon as={MdDelete} height={5} width={5} />}
						colorScheme={'red'}
						variant={'solid'}
						size={'sm'}
						onClick={() => {
							confirmationDialogRef.current?.open('');
						}}
						isLoading={isDeleting}
						isDisabled={selectedAttachments.length === 0}
					>
						Delete Attachment
					</Button>
				</HStack>
			</HStack>
			<TableContainer pt={'0.5rem'} textColor={theme === 'dark' ? 'white' : 'black'}>
				<Table>
					<Thead>
						<Tr>
							<Th width={'5%'}>Sl no</Th>
							<Th width={'10%'}>Name</Th>
							<Th width={''}>Caption</Th>
							<Th width={'10%'}>Actions</Th>
						</Tr>
					</Thead>
					<Tbody>
						{attachments.map((attachment, index) => (
							<Tr key={index}>
								<Td>
									<Checkbox
										colorScheme='green'
										mr={2}
										isChecked={selectedAttachments.includes(attachment.id)}
										onChange={() => addRemoveSelectedAttachments(attachment.id)}
									/>
									{index + 1}.
								</Td>
								<Td>{attachment.name}</Td>
								<Td>
									{attachment.caption.split('\n').map((caption, index) => (
										<Box key={index}>{caption}</Box>
									))}
								</Td>
								<Td>
									<HStack>
										<Tooltip hasArrow label='Edit Attachment Detail' bg='gray.300' color='black'>
											<IconButton
												aria-label='Edit'
												icon={<Icon as={EditIcon} height={5} width={5} />}
												onClick={() => handleAttachmentDetailsEdit(attachment.id)}
											/>
										</Tooltip>
										<Tooltip hasArrow label='Edit Attachment File' bg='gray.300' color='black'>
											<IconButton
												aria-label='change file'
												icon={<Icon as={MdOutlineAttachment} height={5} width={5} />}
												onClick={handleFileChange}
											/>
										</Tooltip>
									</HStack>
								</Td>
							</Tr>
						))}
					</Tbody>
				</Table>
			</TableContainer>
			<ConfirmationDialog
				type={'Attachment'}
				ref={confirmationDialogRef}
				onConfirm={handleDeleteAttachments}
			/>
		</Box>
	);
};

export default AttachmentPage;
