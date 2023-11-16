import { InfoOutlineIcon } from '@chakra-ui/icons';
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
	Divider,
	Flex,
	FormControl,
	FormErrorMessage,
	Icon,
	IconButton,
	Input,
	Select,
	Text,
	useDisclosure,
} from '@chakra-ui/react';
import Multiselect from 'multiselect-react-dropdown';
import React, { ChangeEvent, useRef, useState } from 'react';
import { FiFilter } from 'react-icons/fi';
import { GrDocumentCsv } from 'react-icons/gr';
import { SchedulerDetails } from '..';
import ExportsService from '../../../../services/exports.service';
import GroupService from '../../../../services/group.service';
import LabelService from '../../../../services/label.service';
import UploadsService from '../../../../services/uploads.service';

const NameSection = ({
	details,
	handleChange,
	type,
	setSelectedRecipients,
	error,
	isBusiness,
	isDisabled,
	isHidden,
}: {
	details: {
		campaign_name: string;
		type: string;
		csv_file: string;
		group_ids: string[];
		label_ids: string[];
	};
	handleChange: ({
		name,
		value,
	}: {
		name: keyof SchedulerDetails;
		value: string | number | string[] | undefined;
	}) => Promise<void>;
	type: 'CSV' | 'NUMBERS' | 'GROUP' | 'LABEL' | 'GROUP_INDIVIDUAL';
	setSelectedRecipients: (ids: string[]) => void;
	error: string;
	isBusiness: boolean;
	isDisabled: boolean;
	isHidden: boolean;
}) => {
	const [recipients, setRecipientsOptions] = useState<
		{ id: string; name: string; headers?: string[] }[]
	>([]);
	const fileInputRef = useRef<HTMLInputElement | null>();
	const [uiDetails, setUIDetails] = useState({
		recipientsLoading: false,
		uploadingCSV: false,
		loadingVerifiedContacts: false,
		messageError: '',
	});

	const [newCSVDetails, setNewCSVDetails] = useState<{
		file: File | null;
		name: string;
	}>({
		file: null,
		name: '',
	});

	const {
		isOpen: isCSVNameInputOpen,
		onOpen: openCSVNameInput,
		onClose: closeCSVNameInput,
	} = useDisclosure();

	function fetchRecipients(type: string) {
		setUIDetails((prevState) => ({
			...prevState,
			recipientsLoading: true,
		}));
		if (type === 'GROUP') {
			GroupService.listGroups()
				.then(setRecipientsOptions)
				.finally(() => {
					setUIDetails((prevState) => ({
						...prevState,
						recipientsLoading: false,
					}));
				});
		} else if (type === 'GROUP_INDIVIDUAL') {
			GroupService.listGroups()
				.then(setRecipientsOptions)
				.finally(() => {
					setUIDetails((prevState) => ({
						...prevState,
						recipientsLoading: false,
					}));
				});
		} else if (type === 'LABEL') {
			LabelService.listLabels()
				.then(setRecipientsOptions)
				.catch((err) => {
					if (err === 'BUSINESS_ACCOUNT_REQUIRED') {
						handleChange({ name: 'type', value: 'NUMBERS' });
						setUIDetails((prevState) => ({
							...prevState,
							isBusiness: false,
						}));
					}
				})
				.finally(() => {
					setUIDetails((prevState) => ({
						...prevState,
						recipientsLoading: false,
					}));
				});
		} else if (type === 'CSV') {
			UploadsService.listCSV()
				.then(setRecipientsOptions)
				.finally(() => {
					setUIDetails((prevState) => ({
						...prevState,
						recipientsLoading: false,
					}));
				});
		}
	}

	const handleCSVFileInput = (e: ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files === null) return;
		if (files.length === 0) return;
		if (files[0] === null) return;
		if (files[0].type !== 'text/csv')
			return setUIDetails((prev) => ({
				...prev,
				uploadingCSV: false,
				messageError: 'File type should be CSV',
			}));
		if (files[0].size > 10000000)
			return setUIDetails((prev) => ({
				...prev,
				uploadingCSV: false,
				messageError: 'File size should be less than 10MB',
			}));
		const file = files[0];
		if (fileInputRef.current) fileInputRef.current.value = '';
		setNewCSVDetails((prev) => ({ ...prev, file }));
		openCSVNameInput();
	};

	function uploadNewCSV() {
		if (!newCSVDetails.file) return;
		const { file, name } = newCSVDetails;
		setUIDetails((prev) => ({ ...prev, uploadingCSV: true }));
		UploadsService.uploadCSV({ file, name })
			.then((res) => {
				if (!res) return;
				setRecipientsOptions((prev) => [res, ...prev]);
			})
			.finally(() => {
				setUIDetails((prev) => ({ ...prev, uploadingCSV: false }));
			});
	}

	function exportFilteredNumbers() {
		setUIDetails((prevState) => ({
			...prevState,
			loadingVerifiedContacts: true,
		}));
		ExportsService.exportValidNumbersExcel({
			type: 'CSV',
			csv_file: details.csv_file,
		}).finally(() => {
			setUIDetails((prevState) => ({
				...prevState,
				loadingVerifiedContacts: false,
			}));
		});
	}

	return (
		<FormControl
			isInvalid={!!error}
			display={'flex'}
			flexDirection={'column'}
			gap={2}
			isDisabled={isDisabled}
			hidden={isHidden}
		>
			<Box alignItems='flex-end' justifyContent={'space-between'}>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
					Campaign Name
				</Text>
				<Input
					width={'full'}
					placeholder={'ex. fanfest audience'}
					border={'none'}
					className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353]'
					_placeholder={{ opacity: 0.4, color: 'inherit' }}
					_focus={{ border: 'none', outline: 'none' }}
					value={details.campaign_name}
					onChange={(e) =>
						handleChange({
							name: 'campaign_name',
							value: e.target.value,
						})
					}
				/>
			</Box>
			<Box alignItems='flex-end' justifyContent={'space-between'}>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
					Recipients From
				</Text>
				<Select
					className={`!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full ${
						details.type ? ' text-black dark:text-white' : ' text-gray-700 dark:text-gray-400'
					}`}
					border={'none'}
					placeholder='Recipients'
					value={details.type}
					onChange={(e) => {
						handleChange({ name: 'type', value: e.target.value });
						fetchRecipients(e.target.value);
					}}
				>
					<option
						className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
						value='CSV'
					>
						CSV
					</option>
					<option
						className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
						value='GROUP'
					>
						Groups
					</option>
					<option
						className="'text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] "
						value='GROUP_INDIVIDUAL'
					>
						Group Individuals
					</option>
					{isBusiness ? <option value='LABEL'>Labels</option> : null}
				</Select>
			</Box>
			<Box
				alignItems='flex-end'
				justifyContent={'space-between'}
				hidden={!['CSV', 'GROUP', 'LABEL'].includes(type)}
			>
				<Text fontSize='xs' className='text-gray-700 dark:text-gray-400'>
					Choose
				</Text>
				{type === 'CSV' ? (
					<Flex direction={'column'} gap={2}>
						<Select
							className='!bg-[#ECECEC] dark:!bg-[#535353] rounded-md w-full text-black dark:text-white '
							border={'none'}
							value={details.csv_file}
							onChange={(e) => {
								handleChange({
									name: 'csv_file',
									value: e.target.value,
								});
								const recipient = recipients.find((recipient) => recipient.id === e.target.value);
								if (!recipient || !recipient.headers) return;
								const headers = recipient.headers.map((item) => `{{${item}}}`);
								if (recipient)
									handleChange({
										name: 'variables',
										value: headers,
									});
							}}
						>
							<option
								value={'select'}
								className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
							>
								Select one!
							</option>
							{recipients.map(({ id, name }) => (
								<option
									className='text-black dark:text-white  !bg-[#ECECEC] dark:!bg-[#535353] '
									value={id}
									key={id}
								>
									{name}
								</option>
							))}
						</Select>

						<Flex gap={2} alignItems={'center'}>
							<Divider />
							<Text size={'sm'} className='text-gray-700 dark:text-gray-400'>
								OR
							</Text>
							<Divider />
						</Flex>
						<Flex justifyContent={'space-between'} gap={2}>
							<Button
								flexGrow={1}
								variant={'outline'}
								colorScheme='blue'
								onClick={() => document.getElementById('csv-file-input')?.click()}
								isLoading={uiDetails.uploadingCSV}
							>
								<Text>Upload</Text>
							</Button>
							<IconButton
								variant='outline'
								colorScheme='blue'
								aria-label='Download'
								_hover={{
									backgroundColor: 'transparent',
								}}
								icon={<Icon as={GrDocumentCsv} className='dark:invert' />}
							/>
						</Flex>
						<Box py={'0.5rem'}>
							<Text size={'sm'} color={'tomato'}>
								<InfoOutlineIcon marginRight={'0.25rem'} />
								The first column header should be "number" and should contain numbers with country
								codes. Remaining column headers can be of variables in message
							</Text>
						</Box>
						<Button
							variant={'outline'}
							colorScheme='yellow'
							onClick={exportFilteredNumbers}
							hidden={!details.csv_file || details.csv_file === 'select'}
							isLoading={uiDetails.loadingVerifiedContacts}
							leftIcon={<FiFilter />}
							disabled={isDisabled}
						>
							<Text>Filter Numbers</Text>
						</Button>

						<input
							type='file'
							name='csv-file-input'
							id='csv-file-input'
							className='invisible h-[1px] absolute'
							multiple={false}
							accept='.csv'
							ref={(ref) => (fileInputRef.current = ref)}
							onInput={handleCSVFileInput}
						/>
						<CSVNameInputDialog
							isOpen={isCSVNameInputOpen}
							onClose={() => {
								closeCSVNameInput();
								setNewCSVDetails({ file: null, name: '' });
							}}
							onConfirm={() => {
								uploadNewCSV();
								closeCSVNameInput();
							}}
							handleTextChange={(text) =>
								setNewCSVDetails((prev) => ({
									...prev,
									name: text,
								}))
							}
						/>
					</Flex>
				) : (
					<Multiselect
						disable={uiDetails.recipientsLoading}
						displayValue='displayValue'
						placeholder={
							type === 'GROUP'
								? 'Select Groups'
								: type === 'LABEL'
								? 'Select Labels'
								: 'Select One!'
						}
						onRemove={(selectedList) =>
							setSelectedRecipients(selectedList.map((label: any) => label.id))
						}
						onSelect={(selectedList) =>
							setSelectedRecipients(selectedList.map((label: any) => label.id))
						}
						showCheckbox={true}
						hideSelectedList={true}
						options={recipients.map((item, index) => ({
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
						className='  bg-[#ECECEC] dark:bg-[#535353] rounded-md border-none w-full '
					/>
				)}
			</Box>
			{error && (
				<FormErrorMessage mt={-2} textAlign={'center'}>
					{error}
				</FormErrorMessage>
			)}
		</FormControl>
	);
};

const CSVNameInputDialog = ({
	isOpen,
	onConfirm,
	onClose,
	handleTextChange,
}: {
	onClose: () => void;
	onConfirm: () => void;
	handleTextChange: (text: string) => void;
	isOpen: boolean;
}) => {
	const cancelRef = React.useRef<any>();
	return (
		<AlertDialog
			motionPreset='slideInBottom'
			leastDestructiveRef={cancelRef}
			onClose={onClose}
			isOpen={isOpen}
			isCentered
		>
			<AlertDialogOverlay />

			<AlertDialogContent width={'80%'}>
				<AlertDialogHeader fontSize={'sm'}>Assign a name to the CSV file.</AlertDialogHeader>
				<AlertDialogCloseButton />
				<AlertDialogBody>
					<Input
						width={'full'}
						placeholder={'ex. fanfest audience list'}
						border={'none'}
						className='text-black !bg-[#ECECEC] '
						_placeholder={{ opacity: 0.4, color: 'inherit' }}
						_focus={{ border: 'none', outline: 'none' }}
						onChange={(e) => handleTextChange(e.target.value)}
					/>
				</AlertDialogBody>
				<AlertDialogFooter>
					<Button ref={cancelRef} colorScheme='red' onClick={onClose} size={'sm'}>
						Cancel
					</Button>
					<Button colorScheme='green' onClick={onConfirm} ml={3} size={'sm'}>
						Upload
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default NameSection;
