import {
	Box,
	Button,
	Card,
	CardBody,
	Center,
	Divider,
	Flex,
	FormControl,
	FormLabel,
	Heading,
	Image,
	Modal,
	ModalBody,
	ModalCloseButton,
	ModalContent,
	ModalHeader,
	ModalOverlay,
	Switch,
	Text,
	Textarea,
	VStack,
	useToast,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import Dropzone from 'react-dropzone';
import { useSelector } from 'react-redux';
import GroupService from '../../../../services/group.service';
import { StoreNames, StoreState } from '../../../../store';

type GroupMergeProps = {
	onClose: () => void;
	isOpen: boolean;
};

const GroupSettingDialog = ({ onClose, isOpen }: GroupMergeProps) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size={'4xl'} scrollBehavior='inside'>
			<ModalOverlay />
			<ModalContent>
				<ModalHeader>Group Settings</ModalHeader>
				<ModalCloseButton />
				<ModalBody>
					<VStack gap={'1rem'} padding={'2rem'}>
						<Flex justifyContent={'space-around'} gap={'1rem'}>
							<ProfilePhotoUpdate />
							<OtherDetailsUpdate />
						</Flex>
						<DescriptionUpdate />
					</VStack>
				</ModalBody>
			</ModalContent>
		</Modal>
	);
};

function ProfilePhotoUpdate() {
	const [error, setError] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [fileSRC, setFileSRC] = useState<string | ArrayBuffer | null>(null);
	const toast = useToast();

	const onDrop = useCallback((acceptedFiles: File[]) => {
		// Assuming only one file is dropped, you may adjust accordingly
		const file = acceptedFiles[0];
		setFile(file);
		console.log(file);

		const reader = new FileReader();
		reader.onload = () => {
			const src = reader.result;
			setFileSRC(src);
		};

		reader.readAsDataURL(file);
	}, []);

	const { selectedGroups } = useSelector((state: StoreState) => state[StoreNames.MERGE_GROUP]);

	const handleSubmit = () => {
		if (!file || selectedGroups.length === 0) {
			return;
		}
		toast.promise(GroupService.addProfilePicture(file, selectedGroups), {
			success: {
				title: 'Profile pictures updated.',
			},
			error: {
				title: 'Unable to update profile picture.',
			},
			loading: {
				title: 'Saving profile picture.',
			},
		});
	};

	const handleReset = () => {
		setFile(null);
		setFileSRC(null);
	};
	return (
		<Card width={'400px'} height={'300px'}>
			<CardBody>
				<Heading size='md' marginTop={'0.5rem'} textAlign={'center'}>
					Change Profile Picture
				</Heading>
				<Center justifyContent={'center'} paddingY={'1rem'}>
					{file ? (
						<Image src={fileSRC as string} borderRadius='lg' width={'160px'} height={'160px'} />
					) : (
						<VStack>
							<Dropzone
								onDropAccepted={onDrop}
								maxSize={2097152}
								onDropRejected={() => setError('File size should be less than 2MB')}
								multiple={false}
								accept={{
									'image/*': ['.jpeg', '.png'],
								}}
								onError={(err) => setError(err.message)}
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
										<Text paddingX={'2rem'}>Drag and drop file here, or click to select files</Text>
									</Box>
								)}
							</Dropzone>
							<Box>
								{error && (
									<Text fontSize={'sm'} color={'red'} textAlign={'center'}>
										{error}
									</Text>
								)}
							</Box>
						</VStack>
					)}
				</Center>
				<Divider />
				<Center gap={'0.5rem'} marginTop={'0.5rem'} justifyContent={'center'}>
					<Button variant='solid' colorScheme='blue' size={'sm'} onClick={handleSubmit}>
						Save
					</Button>
					<Button variant='ghost' colorScheme='blue' size={'sm'} onClick={handleReset}>
						Reset
					</Button>
				</Center>
			</CardBody>
		</Card>
	);
}

function DescriptionUpdate() {
	const [text, setText] = useState('');
	const toast = useToast();
	const { selectedGroups } = useSelector((state: StoreState) => state[StoreNames.MERGE_GROUP]);

	const handleSubmit = () => {
		if (!text || selectedGroups.length === 0) {
			return;
		}
		toast.promise(GroupService.updateProfileSettings({ description: text }, selectedGroups), {
			success: {
				title: 'Description Updated.',
			},
			error: {
				title: 'Unable to update description.',
			},
			loading: {
				title: 'Saving description.',
			},
		});
	};

	const handleReset = () => {
		setText('');
	};
	return (
		<Card width={'full'} height={'300px'}>
			<CardBody>
				<Heading size='md' textAlign={'center'}>
					Change Description Text
				</Heading>
				<FormControl marginTop={'1rem'}>
					<Textarea
						width={'full'}
						minHeight={'150px'}
						marginY={'10px'}
						size={'sm'}
						rounded={'md'}
						placeholder={'eg. Hello there!'}
						border={'none'}
						className='text-black !bg-[#ECECEC] '
						_placeholder={{
							opacity: 0.4,
							color: 'inherit',
						}}
						_focus={{ border: 'none', outline: 'none' }}
						value={text}
						onChange={(e) => setText(e.target.value)}
					/>
				</FormControl>
				<Divider marginTop={'0.5rem'} />

				<Center gap={'0.5rem'} marginTop={'0.5rem'} justifyContent={'center'}>
					<Button variant='solid' colorScheme='blue' size={'sm'} onClick={handleSubmit}>
						Save
					</Button>
					<Button variant='ghost' colorScheme='blue' size={'sm'} onClick={handleReset}>
						Reset
					</Button>
				</Center>
			</CardBody>
		</Card>
	);
}

function OtherDetailsUpdate() {
	const [details, setDetails] = useState({
		'edit-group-settings': false,
		'send-messages': false,
		'add-others': false,
		'admin-group-settings': false,
	});
	const toast = useToast();
	const { selectedGroups } = useSelector((state: StoreState) => state[StoreNames.MERGE_GROUP]);

	const handleSubmit = () => {
		if (selectedGroups.length === 0) {
			return;
		}
		toast.promise(
			GroupService.updateProfileSettings(
				{
					edit_group_settings: details['edit-group-settings'],
					send_messages: details['send-messages'],
					add_others: details['add-others'],
					admin_group_settings: details['admin-group-settings'],
				},
				selectedGroups
			),
			{
				success: {
					title: 'Settings Updated.',
				},
				error: {
					title: 'Unable to update settings.',
				},
				loading: {
					title: 'Saving settings.',
				},
			}
		);
	};

	const handleReset = () => {
		setDetails({
			'edit-group-settings': false,
			'send-messages': false,
			'add-others': false,
			'admin-group-settings': false,
		});
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDetails((prev) => ({
			...prev,
			[e.target.name]: e.target.checked,
		}));
	};

	return (
		<Card width={'max-content'} height={'fit-content'}>
			<CardBody>
				<Heading size='md' textAlign={'center'}>
					Members can
				</Heading>
				<Flex marginTop={'1rem'}>
					<VStack width={'400px'}>
						<ToggleSwitch
							text='Edit Group Settings'
							name='edit-group-settings'
							value={details['edit-group-settings']}
							handleChange={handleChange}
						/>
						<ToggleSwitch
							text='Send Messages'
							name='send-messages'
							value={details['send-messages']}
							handleChange={handleChange}
						/>
					</VStack>
				</Flex>

				<Divider marginTop={'0.5rem'} />

				<Center gap={'0.5rem'} marginTop={'0.5rem'} justifyContent={'center'}>
					<Button variant='solid' colorScheme='blue' size={'sm'} onClick={handleSubmit}>
						Save
					</Button>
					<Button variant='ghost' colorScheme='blue' size={'sm'} onClick={handleReset}>
						Reset
					</Button>
				</Center>
			</CardBody>
		</Card>
	);
}

function ToggleSwitch({
	text,
	name,
	value,
	handleChange,
}: {
	text: string;
	name: string;
	value: boolean;
	handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
	return (
		<FormControl display='flex' justifyContent={'space-around'} alignItems='center'>
			<FormLabel htmlFor={name} mb='0' width={'250px'}>
				{text}
			</FormLabel>
			<Switch id={name} checked={value} name={name} onChange={handleChange} />
		</FormControl>
	);
}

export default GroupSettingDialog;
