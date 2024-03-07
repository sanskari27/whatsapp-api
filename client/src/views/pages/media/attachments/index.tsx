import { DeleteIcon, DownloadIcon, EditIcon } from '@chakra-ui/icons';
import {
	Box,
	Button,
	Card,
	CardBody,
	CardFooter,
	Divider,
	Flex,
	Grid,
	GridItem,
	Heading,
	IconButton,
	Stack,
	Text,
	VStack,
	useToast,
} from '@chakra-ui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { IoMdCloudUpload } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useOutlet } from 'react-router-dom';
import APIInstance from '../../../../config/APIInstance';
import { Colors, NAVIGATION, SERVER_URL } from '../../../../config/const';
import useDebounce from '../../../../hooks/useDebounce';
import AttachmentService from '../../../../services/attachment.service';
import { StoreNames, StoreState } from '../../../../store';
import { deleteAttachment, setSearchText } from '../../../../store/reducers/AttachmentReducers';
import { setUserConfig } from '../../../../store/reducers/UserDetailsReducers';
import { Attachment } from '../../../../store/types/AttachmentState';
import Each from '../../../../utils/Each';
import { filterList } from '../../../../utils/listUtils';
import ConfirmationDialog, {
	ConfirmationDialogHandle,
} from '../../../components/confirmation-alert';
import SearchBar from '../../../components/searchbar';
import Preview from './preview.component';

const Attachments = () => {
	const dispatch = useDispatch();
	const outlet = useOutlet();
	const toast = useToast();
	const confirmationDialogRef = useRef<ConfirmationDialogHandle>(null);
	const {
		attachments,
		uiDetails: { searchText },
	} = useSelector((state: StoreState) => state[StoreNames.ATTACHMENT]);

	const {
		ui_config: { load_preview },
	} = useSelector((state: StoreState) => state[StoreNames.USER]);

	const handleDelete = async (id: string) => {
		toast.promise(AttachmentService.deleteAttachment(id), {
			success: () => {
				dispatch(deleteAttachment(id));
				return {
					title: 'Attachment deleted',
				};
			},
			loading: { title: 'Deleting attachment' },
			error: { title: 'Error deleting attachment' },
		});
	};

	const enableLoadPreview = () => {
		dispatch(
			setUserConfig({
				load_preview: true,
			})
		);
	};

	const _searchText = useDebounce(searchText, 1500);
	const filtered = useMemo(() => {
		return filterList(attachments, _searchText, { name: 1 });
	}, [_searchText, attachments]);

	return (
		<Flex direction={'column'} padding={'1rem'} justifyContent={'start'}>
			<Heading color={Colors.PRIMARY_DARK}>
				<Flex width={'98%'} justifyContent={'space-between'} alignItems={'flex-end'}>
					Attachments
					<Link to={NAVIGATION.MEDIA + NAVIGATION.ATTACHMENTS + '/new'}>
						<Button
							variant='outline'
							size={'sm'}
							colorScheme='green'
							leftIcon={<IoMdCloudUpload />}
						>
							Upload Attachment
						</Button>
					</Link>
				</Flex>
			</Heading>

			<Box marginTop={'1rem'} width={'98%'} pb={'5rem'}>
				<SearchBar text={searchText} onTextChange={(text) => dispatch(setSearchText(text))} />
				<Text textAlign={'right'} color={Colors.PRIMARY_DARK}>
					{filtered.length} records found.
				</Text>

				<Flex
					justifyContent={'center'}
					alignItems={'center'}
					gap={'0.25rem'}
					fontSize={'sm'}
					hidden={load_preview}
					marginBottom={'0.5rem'}
					color={Colors.PRIMARY_DARK}
				>
					Preview auto-load is currently disabled.
					<Text
						variant={'unstyled'}
						size='xs'
						color={Colors.ACCENT_DARK}
						fontSize={'sm'}
						textAlign={'center'}
						textDecoration={'underline'}
						textUnderlineOffset={'0.125rem'}
						cursor={'pointer'}
						onClick={enableLoadPreview}
						fontWeight={'medium'}
					>
						Enable
					</Text>
				</Flex>

				<Grid alignItems={'flex-start'} templateColumns='repeat(3, 1fr)' gap={6}>
					<Each
						items={filtered}
						render={(attachment) => (
							<GridItem>
								<PreviewElement
									attachment={attachment}
									onRemove={() => confirmationDialogRef.current?.open(attachment.id)}
								/>
							</GridItem>
						)}
					/>
				</Grid>
			</Box>
			<ConfirmationDialog
				type={'Attachment'}
				ref={confirmationDialogRef}
				onConfirm={handleDelete}
			/>
			{outlet}
		</Flex>
	);
};

export default Attachments;

function PreviewElement({
	attachment,
	onRemove,
}: {
	attachment: Attachment;
	onRemove: () => void;
}) {
	const navigate = useNavigate();
	const [data, setData] = useState<{
		blob: Blob | MediaSource | null;
		url: string | null;
		type: string;
		size: string;
		filename: string;
	} | null>(null);

	const [progress, setProgress] = useState(0);
	const [show_preview, setShowPreview] = useState(false);

	const {
		ui_config: { load_preview },
	} = useSelector((state: StoreState) => state[StoreNames.USER]);

	useEffect(() => {
		APIInstance.head(`${SERVER_URL}uploads/attachment/${attachment.id}/download`, {
			responseType: 'blob',
		}).then((response) => {
			const contentDisposition = response.headers['content-disposition'];
			const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.*)"/);
			const filename = filenameMatch ? filenameMatch[1] : 'downloaded-file';

			const fileType = response.headers['content-type'] as string;
			const fileSizeBytes = parseInt(response.headers['content-length'], 10);
			let type = '';
			if (fileType.includes('image')) {
				type = 'image';
			} else if (fileType.includes('video')) {
				type = 'video';
			} else if (fileType.includes('pdf')) {
				type = 'PDF';
			}

			const fileSizeKB = fileSizeBytes / 1024; // Convert bytes to kilobytes
			const fileSizeMB = fileSizeKB / 1024;
			setData({
				blob: null,
				url: null,
				type,
				size: fileSizeMB > 1 ? `${fileSizeMB.toFixed(2)} MB` : `${fileSizeKB.toFixed(2)} KB`,
				filename,
			});
		});
	}, [attachment, load_preview, show_preview]);
	useEffect(() => {
		if (!load_preview && !show_preview) {
			return;
		}
		APIInstance.get(`${SERVER_URL}uploads/attachment/${attachment.id}/download`, {
			responseType: 'blob',
			onDownloadProgress: (progressEvent) => {
				if (progressEvent.total) {
					setProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
				} else {
					setProgress(-1);
				}
			},
		}).then((response) => {
			const contentDisposition = response.headers['content-disposition'];
			const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.*)"/);
			const filename = filenameMatch ? filenameMatch[1] : 'downloaded-file';

			const { data: blob } = response;
			const url = window.URL.createObjectURL(blob);
			const fileType = blob.type as string;
			const fileSizeBytes = blob.size as number;
			let type = '';

			if (fileType.includes('image')) {
				type = 'image';
			} else if (fileType.includes('video')) {
				type = 'video';
			} else if (fileType.includes('pdf')) {
				type = 'PDF';
			}

			const fileSizeKB = fileSizeBytes / 1024; // Convert bytes to kilobytes
			const fileSizeMB = fileSizeKB / 1024;
			setData({
				blob,
				url,
				type,
				size: fileSizeMB > 1 ? `${fileSizeMB.toFixed(2)} MB` : `${fileSizeKB.toFixed(2)} KB`,
				filename,
			});
		});
	}, [attachment, load_preview, show_preview]);

	const download = () => {
		if (!data || !data.blob) {
			AttachmentService.downloadAttachment(attachment.id);
			return;
		}
		// Create a temporary link element
		const downloadLink = document.createElement('a');
		downloadLink.href = window.URL.createObjectURL(data.blob);
		downloadLink.download = data.filename; // Specify the filename

		// Append the link to the body and trigger the download
		document.body.appendChild(downloadLink);
		downloadLink.click();

		// Clean up - remove the link
		document.body.removeChild(downloadLink);
	};

	return (
		<Card size='sm' rounded={'2xl'}>
			<CardBody>
				<Preview
					data={data?.url ? { url: data.url, type: data.type } : null}
					progress={progress}
					onShowPreview={() => setShowPreview(true)}
				/>
				<Stack mt='3'>
					<Heading size='md'>{attachment.name}</Heading>
				</Stack>
			</CardBody>
			<Divider />
			<CardFooter>
				<VStack alignItems={'stretch'} width={'full'}>
					<Flex gap={'0.5rem'} alignItems={'center'}>
						<Text>File Type:</Text>
						<Text fontWeight={'medium'}>{data?.type}</Text>
					</Flex>
					<Flex gap={'0.5rem'} alignItems={'center'}>
						<Text>File Size:</Text>

						<Text fontWeight={'medium'}>{data?.size}</Text>
					</Flex>
					<Flex gap='2'>
						<Button
							flexGrow={1}
							leftIcon={<EditIcon />}
							variant='solid'
							colorScheme='green'
							onClick={() =>
								navigate(NAVIGATION.MEDIA + NAVIGATION.ATTACHMENTS + '/' + attachment.id)
							}
						>
							Edit
						</Button>
						<Button
							leftIcon={<DownloadIcon />}
							variant='outline'
							colorScheme='green'
							onClick={download}
							flexGrow={1}
						>
							Download
						</Button>
						<IconButton
							aria-label='delete'
							icon={<DeleteIcon color={'red.400'} />}
							variant='unstyled'
							colorScheme='red'
							border={'1px red solid'}
							_hover={{
								bgColor: 'red.100',
							}}
							onClick={onRemove}
						/>
					</Flex>
				</VStack>
			</CardFooter>
		</Card>
	);
}
